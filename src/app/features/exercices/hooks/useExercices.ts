'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect } from 'react';
import type { Exercice } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
// ⚡ FIX TIMEZONE: On envoie le dateKey (yyyy-MM-dd) directement, pas un ISO string
// Voir CLAUDE.md → section "Timezone" pour comprendre pourquoi

type UseExercicesOptions = {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
};

type UseExercicesReturn = {
  exercices: Exercice[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateExercice: (updatedExercice: Exercice) => void;
};

/**
 * Hook personnalisé pour gérer les exercices
 * Centralise la logique de récupération et de mise à jour des exercices
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useExercices({ category, equipments, includeArchived }: UseExercicesOptions = {}): UseExercicesReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const { isTimeMachineMode, referenceDate, referenceDateKey } = useTimeContext();
  const queryClient = useQueryClient();
  
  // ⚡ SIMPLICITÉ: Utiliser referenceDateKey directement pour construire targetDate
  // ⚡ MODES: Inclure resetFrequency dans la clé pour que le cache soit distinct par mode (DAILY/WEEKLY)
  const filters = useMemo(() => {
    let targetDate: string | undefined;
    if (isTimeMachineMode && referenceDateKey) {
      targetDate = referenceDateKey;
    }
    return {
      category,
      equipments,
      includeArchived,
      targetDate,
      resetFrequency: effectiveUser?.resetFrequency || 'DAILY',
    };
  }, [category, equipments, includeArchived, isTimeMachineMode, referenceDateKey, effectiveUser?.resetFrequency]);
  
  // ⚡ TANSTACK QUERY: Utiliser useQuery pour gérer le fetch et le cache
  // ⚡ PARALLEL QUERIES: Retirer !userLoading pour permettre le chargement en parallèle
  // TanStack Query démarrera automatiquement la requête dès que effectiveUser est disponible
  const queryResult = useQuery({
    queryKey: queryKeys.exercices.list(filters),
    queryFn: () => fetchExercices(filters),
    enabled: !!effectiveUser, // Démarrer dès que l'utilisateur est disponible (pas besoin d'attendre userLoading)
    // ⚡ FIX: Ne pas utiliser placeholderData en mode sablier pour éviter d'afficher les anciennes données
    // placeholderData garde les données même si la query key change (targetDate différent),
    // ce qui cause des bugs en prod où les gauges affichent les mauvaises données
    // En mode sablier, on préfère un bref chargement plutôt que des données incorrectes
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    // ⚡ FIX BUG HARD REFRESH: Réduire drastiquement staleTime pour forcer un refetch plus fréquent
    // Cela garantit que les données sont toujours à jour, même après navigation
    staleTime: 0, // Toujours considérer comme stale pour forcer le refetch
    gcTime: 2 * 60 * 1000, // 2 minutes
    // ⚡ FIX BUG HARD REFRESH: Forcer le refetch au montage pour garantir des données fraîches
    // Cela évite d'avoir besoin d'un hard refresh pour voir les dernières données
    refetchOnMount: true,
    // ⚡ FIX BUG HARD REFRESH: Refetch aussi quand la fenêtre reprend le focus
    // Utile quand on revient sur l'onglet après avoir complété un exercice ailleurs
    refetchOnWindowFocus: true,
  });

  const { data: exercices = [], isLoading, error, refetch } = queryResult;

  useEffect(() => {
    if (!effectiveUser) return;
    
    const timeoutId = setTimeout(() => {
      refetch();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [referenceDateKey, effectiveUser, refetch]);

  useEffect(() => {
    if (exercices.length > 0 || !isLoading) {
      console.log('[EXERCICES] 📋 Exercices récupérés:', {
        count: exercices.length,
        targetDate: filters.targetDate,
        exercices: exercices.map(ex => ({
          id: ex.id,
          name: ex.name,
          completed: ex.completed,
          completedToday: ex.completedToday,
        })),
      });
    }
  }, [exercices, filters.targetDate, isLoading]);

  // ⚡ OPTIMISTIC UPDATE: Mettre à jour le cache localement pour une UI réactive
  const updateExercice = useCallback((updatedExercice: Exercice) => {
    queryClient.setQueryData<Exercice[]>(
      queryKeys.exercices.list(filters),
      (old) => {
        if (!old) return [updatedExercice];
        return old.map(ex => ex.id === updatedExercice.id ? updatedExercice : ex);
      }
    );
  }, [filters, queryClient]);

  return {
    exercices,
    // ⚡ PARALLEL QUERIES: Ne plus inclure userLoading dans le loading
    // car les requêtes démarrent en parallèle dès que l'utilisateur est disponible
    // ⚡ FIX: Utiliser uniquement isLoading (pas isFetching) pour l'état de chargement
    // isLoading = true uniquement quand il n'y a PAS de données en cache (premier chargement)
    // isFetching = true aussi lors des refetch en arrière-plan (invalidation après complétion)
    // Inclure isFetching causait un rechargement visuel de toute la page catégorie
    // à chaque complétion d'exercice (alors que setQueriesData avait déjà mis à jour les données)
    loading: isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
    updateExercice,
  };
}
