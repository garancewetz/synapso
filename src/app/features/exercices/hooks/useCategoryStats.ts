'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';
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

  const queryResult = useQuery({
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
        referenceDateKey,
      });
      return newStats;
    },
    // ⚡ FIX BUG GAUGES: Ne jamais utiliser placeholderData en mode sablier pour éviter d'afficher les anciennes données
    // Quand on change de jour, la query key change (referenceDateKey différent), mais TanStack Query
    // peut encore avoir les anciennes données en cache. En utilisant undefined, on force un état de chargement
    // plutôt que d'afficher des données incorrectes.
    // En mode normal (aujourd'hui), on peut utiliser placeholderData pour une meilleure UX.
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    // ⚡ FIX BUG HARD REFRESH: Réduire drastiquement staleTime pour forcer un refetch plus fréquent
    // Cela garantit que les données sont toujours à jour, même après navigation
    staleTime: 0, // Toujours considérer comme stale pour forcer le refetch
    gcTime: 2 * 60 * 1000,
    // ⚡ FIX BUG HARD REFRESH: Forcer le refetch au montage pour garantir des données fraîches
    // Cela évite d'avoir besoin d'un hard refresh pour voir les dernières données
    refetchOnMount: true,
    // ⚡ FIX BUG HARD REFRESH: Refetch aussi quand la fenêtre reprend le focus
    // Utile quand on revient sur l'onglet après avoir complété un exercice ailleurs
    refetchOnWindowFocus: true,
  });

  const { data: stats, isLoading, error, isFetching, refetch } = queryResult;

  // ⚡ FIX BUG HARD REFRESH: Forcer un refetch explicite quand referenceDateKey change
  // TanStack Query devrait automatiquement refetch quand la query key change, mais parfois
  // le cache peut interférer. Ce useEffect garantit un refetch explicite.
  useEffect(() => {
    if (!effectiveUser) return;
    
    // Forcer un refetch quand la date change (même en mode normal, pour garantir des données fraîches)
    // Utiliser un petit délai pour éviter les refetchs multiples lors du montage initial
    const timeoutId = setTimeout(() => {
      refetch();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [referenceDateKey, effectiveUser, refetch]);

  // ⚡ FIX BUG GAUGES: Utiliser les stats calculées ou initialStats si pas encore chargé
  // En mode sablier, si isLoading est true, on retourne initialStats (tous à 0) plutôt que
  // d'utiliser des données potentiellement incorrectes d'une autre date
  const finalStats = stats ?? initialStats;
  
  // ⚡ FIX BUG GAUGES: En mode sablier, considérer comme loading si on est en train de fetch
  // Cela évite d'afficher des données incorrectes pendant le changement de jour
  const isActuallyLoading = isTimeMachineMode ? (isLoading || isFetching) : isLoading;

  return {
    stats: finalStats,
    loading: isActuallyLoading,
    error: error as Error | null,
    refresh: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.exercices.all,
        refetchType: 'active',
      });
    },
  };
}
