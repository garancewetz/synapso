'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subDays, format, startOfDay } from 'date-fns';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchExercices, fetchCategoryStats } from '@/app/lib/api-queries';

export function usePrefetchPreviousDates() {
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!effectiveUser) return;

    const resetFrequency = effectiveUser.resetFrequency || 'DAILY';
    const today = startOfDay(new Date());
    const daysToPrefetch = [1, 2, 3];

    daysToPrefetch.forEach((daysAgo) => {
      const targetDate = subDays(today, daysAgo);
      const dateKey = format(targetDate, 'yyyy-MM-dd');

      queryClient.prefetchQuery({
        queryKey: queryKeys.exercices.list({
          targetDate: dateKey,
        }),
        queryFn: () => fetchExercices({
          targetDate: dateKey,
        }),
        staleTime: 5 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: queryKeys.categoryStats.list({
          userId: effectiveUser.id,
          resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
          referenceDateKey: dateKey,
        }),
        queryFn: () => fetchCategoryStats({
          userId: effectiveUser.id,
          resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
          referenceDateKey: dateKey,
        }),
        staleTime: 5 * 60 * 1000,
      });
    });
  }, [effectiveUser, queryClient]);
}
