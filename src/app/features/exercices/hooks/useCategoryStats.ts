'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
// ⚡ FIX TIMEZONE: On envoie le dateKey (yyyy-MM-dd) directement, pas un ISO string

type UseCategoryStatsReturn = {
  stats: Record<ExerciceCategory, number>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

const initialStats: Record<ExerciceCategory, number> = {
  UPPER_BODY: 0,
  LOWER_BODY: 0,
  STRETCHING: 0,
  CORE: 0,
};

/**
 * Hook pour calculer les stats par catégorie pour la date de référence
 * 
 * ⚡ BONNE PRATIQUE REACT: Utilise directement TanStack Query avec `select` pour calculer
 * les stats directement dans la query, évitant les dépendances en cascade et les race conditions.
 * 
 * ⚡ STABILITÉ: La query key inclut referenceDateKey, donc les stats sont toujours synchronisées
 * avec la date actuelle. Pas besoin de vérifier manuellement si les données sont obsolètes.
 */
export function useCategoryStats(): UseCategoryStatsReturn {
  const queryClient = useQueryClient();
  const { effectiveUser } = useUser();
  const { isTimeMachineMode, referenceDateKey } = useTimeContext();
  
  // ⚡ BONNE PRATIQUE: Calculer les filtres une seule fois
  const filters = useMemo(() => {
    let targetDate: string | undefined;
    if (isTimeMachineMode && referenceDateKey) {
      targetDate = referenceDateKey;
    }
    
    return {
      targetDate,
    };
  }, [isTimeMachineMode, referenceDateKey]);

  // ⚡ BONNE PRATIQUE: Utiliser la même query key que useExercices et `select` pour transformer
  // les données directement. Cela garantit que les stats sont toujours synchronisées avec les exercices
  // et partage le cache, évitant les race conditions et les doublons de requêtes
  const exercicesQueryKey = queryKeys.exercices.list(filters);

  console.log('[DEBUG-PROD] useCategoryStats:', {
    isTimeMachineMode,
    referenceDateKey,
    filters,
    queryKey: JSON.stringify(exercicesQueryKey),
  });

  const { data: stats = initialStats, isLoading, error } = useQuery({
    queryKey: exercicesQueryKey,
    queryFn: () => fetchExercices(filters),
    enabled: !!effectiveUser,
    // ⚡ BONNE PRATIQUE: Utiliser `select` pour transformer les données directement dans la query
    // Cela garantit que les stats sont toujours calculées avec les données de la query actuelle
    // ⚡ IMPORTANT: TanStack Query recalcule automatiquement les queries avec `select` quand les données de base changent
    select: (exercices) => {
      const newStats: Record<ExerciceCategory, number> = { ...initialStats };
      exercices.forEach((exercice) => {
        if (exercice.completedToday && exercice.category && exercice.category in newStats) {
          newStats[exercice.category as ExerciceCategory]++;
        }
      });
      console.log('[DEBUG-PROD] useCategoryStats → select:', {
        totalExercices: exercices.length,
        completedToday: exercices.filter(e => e.completedToday).map(e => ({ name: e.name, category: e.category })),
        stats: newStats,
      });
      return newStats;
    },
    // ⚡ FIX: Ne pas utiliser placeholderData en mode sablier pour éviter d'afficher les anciennes données
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 10000,
    gcTime: 2 * 60 * 1000,
  });

  return {
    stats,
    loading: isLoading,
    error: error as Error | null,
    refresh: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.exercices.all,
        refetchType: 'active',
      });
    },
  };
}
