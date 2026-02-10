'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
import { dateKeyToISO } from '@/app/utils/date.utils';

export function useTodayCompletedCount() {
  const { effectiveUser } = useUser();
  const { referenceDateKey, isTimeMachineMode } = useTimeContext();

  const filters = useMemo(() => {
    let targetDate: string | undefined;
    if (isTimeMachineMode && referenceDateKey) {
      targetDate = dateKeyToISO(referenceDateKey);
    }
    return { targetDate };
  }, [isTimeMachineMode, referenceDateKey]);

  const { data: completedToday = null } = useQuery({
    queryKey: queryKeys.exercices.list(filters),
    queryFn: () => fetchExercices(filters),
    enabled: !!effectiveUser,
    select: (exercices) => exercices.filter(ex => ex.completedToday).length,
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 10000,
    gcTime: 2 * 60 * 1000,
  });

  return completedToday;
}
