'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';

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

export function useCategoryStats(): UseCategoryStatsReturn {
  const queryClient = useQueryClient();
  const { effectiveUser } = useUser();
  const { referenceDateKey, isTimeMachineMode } = useTimeContext();

  const referenceDateForQuery = isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;

  const { data: stats = initialStats, isLoading, error } = useQuery({
    queryKey: queryKeys.history.list({ days: 40, referenceDate: referenceDateForQuery }),
    queryFn: () => fetchHistory({ days: 40, referenceDate: referenceDateForQuery }),
    enabled: !!effectiveUser && !!referenceDateKey,
    select: (history) => {
      if (!referenceDateKey || !history.length) {
        return initialStats;
      }

      const stats: Record<ExerciceCategory, number> = { ...initialStats };
      
      for (const entry of history) {
        const entryDateKey = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
        if (entryDateKey === referenceDateKey && entry.exercice.category && entry.exercice.category in stats) {
          stats[entry.exercice.category as ExerciceCategory]++;
        }
      }

      return stats;
    },
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 1000,
    gcTime: 2 * 60 * 1000,
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
