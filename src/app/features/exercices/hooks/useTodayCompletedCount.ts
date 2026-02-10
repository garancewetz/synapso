'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchTodayCompletedCount } from '@/app/lib/api-queries';

export function useTodayCompletedCount() {
  const { effectiveUser } = useUser();
  const { referenceDateKey, isTimeMachineMode } = useTimeContext();

  const { data: completedToday = null } = useQuery({
    queryKey: queryKeys.todayCompletedCount.list({
      userId: effectiveUser?.id || 0,
      dateKey: referenceDateKey,
    }),
    queryFn: () => fetchTodayCompletedCount({
      userId: effectiveUser!.id,
      dateKey: referenceDateKey,
    }),
    enabled: !!effectiveUser,
    // ⚡ FIX: Ne pas utiliser placeholderData en mode sablier pour éviter d'afficher les anciennes données
    // placeholderData garde les données même si la query key change (date différente),
    // ce qui cause des bugs où la gauge affiche les mauvaises données
    // En mode sablier, on préfère un bref chargement plutôt que des données incorrectes
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    // ⚡ OPTIMISATION: Données qui changent souvent, cache plus court
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  return completedToday;
}
