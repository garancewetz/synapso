'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Query } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import type { Exercice, HistoryEntry } from '@/app/types';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
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

/**
 * Prédicat pour cibler uniquement les queries exercices du jour sélectionné.
 * Évite de corrompre le cache des autres jours lors des optimistic updates.
 */
function matchesTargetDate(query: Query, targetDateForQuery: string | undefined): boolean {
  // Query key: ['exercices', 'list', { targetDate?: string, ... }]
  if (query.queryKey.length < 3) return false;
  const filters = query.queryKey[2] as { targetDate?: string } | undefined;
  return (filters?.targetDate ?? undefined) === targetDateForQuery;
}

export function useCompleteExercice({
  exercice,
  userId,
  onCompleted,
}: UseCompleteExerciceOptions): UseCompleteExerciceReturn {
  const [showSuccess, setShowSuccess] = useState(false);
  const { selectedDate } = useSelectedDate();
  const { isTimeMachineMode, referenceDateKey } = useTimeContext();
  const queryClient = useQueryClient();

  // ⚡ FIX BUG 1: Calculer le targetDate pour les query keys avec la MÊME logique que useExercices
  // Garantit que les optimistic updates ciblent les mêmes queries que l'affichage
  const targetDateForQuery = useMemo(() => {
    return isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;
  }, [isTimeMachineMode, referenceDateKey]);

  // DateKey pour l'API et les comparaisons de dates
  const targetDateKey = useMemo(() => {
    return targetDateForQuery || format(new Date(), 'yyyy-MM-dd');
  }, [targetDateForQuery]);

  const mutation = useMutation({
    mutationFn: async () => {
      const fetchOptions: RequestInit = {
        method: 'PATCH',
        credentials: 'include',
      };

      // ⚡ FIX: Utiliser isTimeMachineMode + referenceDateKey (cohérent avec les query keys)
      // au lieu de selectedDateKey qui peut être défini même quand isTimeMachineMode = false
      if (isTimeMachineMode && referenceDateKey) {
        fetchOptions.headers = {
          'Content-Type': 'application/json',
        };
        fetchOptions.body = JSON.stringify({ completedAt: referenceDateKey });
      }

      const response = await fetch(`/api/exercices/${exercice.id}/complete?userId=${userId}`, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      return response.json();
    },
    onMutate: async () => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: queryKeys.exercices.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.history.all });

      // ⚡ FIX BUG 1: Snapshot uniquement des queries du jour ciblé (pour rollback)
      const exercicesQueryFilter = {
        queryKey: queryKeys.exercices.lists(),
        predicate: (query: Query) => matchesTargetDate(query, targetDateForQuery),
      };
      const previousExercicesQueries = queryClient.getQueriesData<Exercice[]>(exercicesQueryFilter);
      const previousHistoryQueries = queryClient.getQueriesData({ queryKey: queryKeys.history.all });

      // ⚡ FIX MODE SABLIER: Le serveur toggle basé sur l'existence d'une entrée pour le JOUR cible
      // (= completedToday), pas sur "complété dans la période" (= completed).
      const newCompletedToday = !(exercice.completedToday ?? false);

      // ⚡ FIX BUG 2: Calculer completed en tenant compte du mode WEEKLY
      // En mode WEEKLY, décompleter un jour ne signifie pas que l'exercice n'est plus complété
      // si d'autres jours de la semaine ont des completions
      const currentWeeklyCompletions = exercice.weeklyCompletions || [];
      const newWeeklyCompletions = newCompletedToday
        ? [...currentWeeklyCompletions, new Date(targetDateKey + 'T12:00:00.000Z')]
        : currentWeeklyCompletions.filter(d => {
            const key = format(new Date(d), 'yyyy-MM-dd');
            return key !== targetDateKey;
          });
      const newCompleted = newCompletedToday ? true : newWeeklyCompletions.length > 0;

      const newCompletedAt = newCompleted ? (selectedDate || new Date()) : null;

      // ⚡ FIX BUG 1: Optimistic update uniquement pour les queries du jour ciblé
      queryClient.setQueriesData<Exercice[]>(
        exercicesQueryFilter,
        (old) => {
          if (!old) return old;
          return old.map(ex =>
            ex.id === exercice.id
              ? {
                  ...ex,
                  completed: newCompleted,
                  completedToday: newCompletedToday,
                  completedAt: newCompletedAt,
                  weeklyCompletions: newWeeklyCompletions,
                }
              : ex
          );
        }
      );

      // Optimistic update heatmap (l'historique est global, filtré par date dans l'updater)
      const isAddingToHistory = newCompletedToday;

      if (isAddingToHistory) {
        const optimisticEntry: HistoryEntry = {
          id: -Date.now(),
          completedAt: targetDateKey + 'T12:00:00.000Z',
          exercice: {
            id: exercice.id,
            name: exercice.name,
            category: exercice.category,
            bodyparts: exercice.bodyparts.map(name => ({ id: 0, name })),
            equipments: exercice.equipments,
          },
        };
        queryClient.setQueriesData<HistoryEntry[]>(
          { queryKey: queryKeys.history.all },
          (old) => old ? [...old, optimisticEntry] : [optimisticEntry]
        );
      } else {
        queryClient.setQueriesData<HistoryEntry[]>(
          { queryKey: queryKeys.history.all },
          (old) => {
            if (!old) return old;
            return old.filter(entry => {
              if (entry.exercice.id !== exercice.id) return true;
              const entryDateKey = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
              return entryDateKey !== targetDateKey;
            });
          }
        );
      }

      return { previousExercicesQueries, previousHistoryQueries };
    },
    onError: (error, _variables, context) => {
      console.error('Erreur lors de la mise à jour de l\'exercice:', error);

      // Rollback : restaurer les données précédentes
      if (context?.previousExercicesQueries) {
        context.previousExercicesQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousHistoryQueries) {
        context.previousHistoryQueries.forEach(([queryKey, data]) => {
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
        // ⚡ FIX BUG 4: [] est truthy en JS, utiliser .length pour détecter un tableau vide
        weeklyCompletions: data.weeklyCompletions?.length > 0
          ? data.weeklyCompletions
          : exercice.weeklyCompletions,
      };

      if (!wasCompletedToday && updatedExercice.completedToday) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      }

      if (onCompleted) {
        onCompleted(updatedExercice);
      }

      // ⚡ FIX BUG 1: Mettre à jour uniquement les queries du jour ciblé avec les données serveur
      queryClient.setQueriesData<Exercice[]>(
        {
          queryKey: queryKeys.exercices.lists(),
          predicate: (query: Query) => matchesTargetDate(query, targetDateForQuery),
        },
        (old) => {
          if (!old) return old;
          return old.map(ex => ex.id === exercice.id ? updatedExercice : ex);
        }
      );

      // Invalidation différée : marquer stale après 2s
      // Le refetch se fera au prochain montage/focus
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.exercices.all,
          refetchType: 'none',
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.history.all,
          refetchType: 'none',
        });
      }, 2000);
    },
  });

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    mutation.mutate();
  };

  return {
    handleComplete,
    isCompleting: mutation.isPending,
    showSuccess,
  };
}
