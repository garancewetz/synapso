'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';
import { getDateKeyUTC, getUTCWeekBoundsForDateKey } from '@/app/utils/date.utils';

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
  MAXILLO_FACIAL: 0,
};

export function useCategoryStats(): UseCategoryStatsReturn {
  const queryClient = useQueryClient();
  const { effectiveUser } = useUser();
  const { referenceDateKey, isTimeMachineMode } = useTimeContext();

  const referenceDateForQuery = isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;
  const resetFrequency = effectiveUser?.resetFrequency || 'DAILY';

  const { data: stats = initialStats, isLoading, error } = useQuery({
    // ⚡ Query key inclut resetFrequency pour invalider le cache lors du changement de mode
    queryKey: [
      ...queryKeys.history.list({ days: 40, referenceDate: referenceDateForQuery }),
      resetFrequency,
    ],
    queryFn: () => fetchHistory({ days: 40, referenceDate: referenceDateForQuery }),
    enabled: !!effectiveUser && !!referenceDateKey,
    select: (history) => {
      if (!referenceDateKey || !history.length) {
        return initialStats;
      }

      const stats: Record<ExerciceCategory, number> = { ...initialStats };
      const seenByCategory: Record<ExerciceCategory, Set<number>> = {
        UPPER_BODY: new Set(),
        LOWER_BODY: new Set(),
        STRETCHING: new Set(),
        CORE: new Set(),
        MAXILLO_FACIAL: new Set(),
      };

      const weekBounds =
        resetFrequency === 'WEEKLY' ? getUTCWeekBoundsForDateKey(referenceDateKey) : null;

      for (const entry of history) {
        const category = entry.exercice.category as ExerciceCategory | undefined;
        if (!category || !(category in stats)) continue;

        let inPeriod: boolean;
        if (resetFrequency === 'DAILY') {
          inPeriod = getDateKeyUTC(entry.completedAt) === referenceDateKey;
        } else {
          if (!weekBounds) continue;
          const completedAt = new Date(entry.completedAt).getTime();
          inPeriod =
            completedAt >= weekBounds.start.getTime() && completedAt < weekBounds.end.getTime();
        }

        if (inPeriod) {
          seenByCategory[category].add(entry.exercice.id);
        }
      }

      for (const cat of Object.keys(seenByCategory) as ExerciceCategory[]) {
        stats[cat] = seenByCategory[cat].size;
      }

      return stats;
    },
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 30 * 1000, // 30 secondes — évite les refetches excessifs
    gcTime: 2 * 60 * 1000,
    refetchOnMount: true, // refetch seulement si stale (pas 'always')
    refetchOnWindowFocus: false,
  });

  return {
    stats,
    loading: isLoading,
    error: error as Error | null,
    refresh: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.history.all,
        refetchType: 'active',
      });
    },
  };
}
