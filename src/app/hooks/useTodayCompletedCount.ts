'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { queryKeys, fetchTodayCompletedCount } from '@/app/lib/api-queries';

export function useTodayCompletedCount() {
  const { effectiveUser } = useUser();
  const { selectedDateKey } = useSelectedDate();

  const { data: completedToday = null } = useQuery({
    queryKey: queryKeys.todayCompletedCount.list({
      userId: effectiveUser?.id || 0,
      dateKey: selectedDateKey,
    }),
    queryFn: () => fetchTodayCompletedCount({
      userId: effectiveUser!.id,
      dateKey: selectedDateKey,
    }),
    enabled: !!effectiveUser,
    // ⚡ TRANSITION FLUIDE: Garder les données précédentes pendant le chargement
    placeholderData: (previousData) => previousData,
    // ⚡ OPTIMISATION: Données qui changent souvent, cache plus court
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  return completedToday;
}
