'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Exercice } from '@/app/types';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { queryKeys } from '@/app/lib/api-queries';

type UseCompleteExerciceOptions = {
  exercice: Exercice;
  userId: number;
  onCompleted?: (updatedExercice: Exercice) => void;
};

type UseCompleteExerciceReturn = {
  handleComplete: (e: React.MouseEvent) => void;
  isCompleting: boolean;
  showSuccess: boolean;
};

export function useCompleteExercice({
  exercice,
  userId,
  onCompleted,
}: UseCompleteExerciceOptions): UseCompleteExerciceReturn {
  const [showSuccess, setShowSuccess] = useState(false);
  const { selectedDate } = useSelectedDate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const fetchOptions: RequestInit = {
        method: 'PATCH',
        credentials: 'include',
      };
      
      if (selectedDate) {
        fetchOptions.headers = {
          'Content-Type': 'application/json',
        };
        fetchOptions.body = JSON.stringify({ completedAt: selectedDate.toISOString() });
      }
      
      const response = await fetch(`/api/exercices/${exercice.id}/complete?userId=${userId}`, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      return response.json();
    },
    // ⚡ OPTIMISTIC UPDATE: Mettre à jour le cache immédiatement pour une UI réactive
    onMutate: async () => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: queryKeys.exercices.all });
      
      // Snapshot de la valeur précédente pour rollback en cas d'erreur
      const previousExercicesQueries = queryClient.getQueriesData({ queryKey: queryKeys.exercices.all });
      
      // Calculer le nouvel état pour le mode sablier
      const newCompleted = !exercice.completed;
      const newCompletedAt = newCompleted ? (selectedDate || new Date()) : null;
      
      // En mode sablier, completedToday doit être calculé pour la date sélectionnée
      // Le serveur vérifie s'il y a une entrée dans l'historique pour le jour cible
      // En optimistic update, on simule :
      // - Si on complète pour la date cible (selectedDate ou aujourd'hui), completedToday = true
      // - Si on décomplète, completedToday = false (peu importe la date)
      // Le jour cible est selectedDate en mode sablier, sinon aujourd'hui
      const targetDateForCheck = selectedDate || new Date();
      const today = new Date();
      const isTargetDateToday = targetDateForCheck.toDateString() === today.toDateString();
      
      // Si on complète pour la date cible (qui est aujourd'hui ou la date sélectionnée = aujourd'hui), completedToday = true
      // Si on décomplète, completedToday = false
      // Si on complète pour un jour passé (mode sablier avec date passée), completedToday = false
      const newCompletedToday = newCompleted && isTargetDateToday;
      
      // Optimistic update pour toutes les queries d'exercices
      queryClient.setQueriesData<Exercice[]>(
        { queryKey: queryKeys.exercices.all },
        (old) => {
          if (!old) return old;
          return old.map(ex => 
            ex.id === exercice.id 
              ? { 
                  ...ex, 
                  completed: newCompleted, 
                  completedToday: newCompletedToday,
                  completedAt: newCompletedAt,
                }
              : ex
          );
        }
      );

      return { previousExercicesQueries };
    },
    onError: (error, variables, context) => {
      console.error('Erreur lors de la mise à jour de l\'exercice:', error);
      
      // ⚡ ROLLBACK: Restaurer les données précédentes en cas d'erreur
      if (context?.previousExercicesQueries) {
        context.previousExercicesQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      const wasCompletedToday = exercice.completedToday ?? false;
      
      const updatedExercice: Exercice = {
        ...exercice,
        completed: data.completed,
        completedToday: data.completedToday ?? false,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        weeklyCompletions: data.weeklyCompletions || exercice.weeklyCompletions,
      };

      if (!wasCompletedToday && updatedExercice.completedToday) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }

      if (onCompleted) {
        onCompleted(updatedExercice);
      }

      // ⚡ OPTIMISATION: Mettre à jour directement les queries avec les données du serveur
      // au lieu de les invalider (évite les refetch inutiles)
      queryClient.setQueriesData<Exercice[]>(
        { queryKey: queryKeys.exercices.all },
        (old) => {
          if (!old) return old;
          return old.map(ex => ex.id === exercice.id ? updatedExercice : ex);
        }
      );
      
      // ⚡ BONNE PRATIQUE TANSTACK QUERY: Quand on utilise `select` dans une query,
      // TanStack Query recalcule automatiquement les queries avec `select` quand les données de base changent.
      // Mais pour s'assurer que les composants se mettent à jour immédiatement, on force le recalcul
      // en invalidant les queries avec `refetchType: 'none'`. Cela marque les queries comme stale
      // et force le recalcul des `select` sans refetch.
      queryClient.invalidateQueries({
        queryKey: queryKeys.exercices.all,
        refetchType: 'none', // Ne pas refetch, mais forcer le recalcul des `select`
      });

      // ⚡ CACHE INVALIDATION: Invalider les queries qui nécessitent un recalcul complexe
      // ⚡ PERFORMANCE: Utiliser refetchType: 'none' pour éviter les refetches bloquants
      // Les queries seront marquées comme stale et se refetch en arrière-plan si nécessaire
      // Cela rend l'UI plus réactive car l'optimistic update est déjà appliqué
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.history.all,
        refetchType: 'none', // Ne pas forcer le refetch immédiat (plus rapide)
      });
      
      // ⚡ OPTIMISATION: Les queries invalidées se refetch automatiquement en arrière-plan
      // si elles sont actives (montées), mais de manière non-bloquante
      // L'optimistic update garantit que l'UI est déjà à jour
    },
  });

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    // ⚡ PERFORMANCE: Utiliser mutate() au lieu de mutateAsync() pour ne pas bloquer
    // L'optimistic update rend l'UI réactive immédiatement
    mutation.mutate();
  };

  return {
    handleComplete,
    isCompleting: mutation.isPending,
    showSuccess,
  };
}
