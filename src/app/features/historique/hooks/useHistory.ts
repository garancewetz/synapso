'use client';

import { useQuery } from '@tanstack/react-query';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';
// ⚡ FIX TIMEZONE: On envoie le dateKey (yyyy-MM-dd) directement, pas un ISO string

type UseHistoryOptions = {
  days?: number | null;
};

type UseHistoryReturn = {
  history: HistoryEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { days = 40 } = options;
  const { effectiveUser } = useUser();
  const { referenceDateKey, isTimeMachineMode } = useTimeContext();

  // ⚡ FIX TIMEZONE: Envoyer le dateKey directement au lieu de l'ISO string
  // new Date('2026-02-06') est parsé comme UTC midnight par la spec JS, ce qui est correct
  const referenceDateForQuery = isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;

  console.log('[DEBUG-PROD] useHistory:', {
    isTimeMachineMode,
    referenceDateKey,
    referenceDateForQuery,
    days,
  });

  const { data: history = [], isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.history.list({ days: days || undefined, referenceDate: referenceDateForQuery }),
    queryFn: () => fetchHistory({ days: days || undefined, referenceDate: referenceDateForQuery }),
    enabled: !!effectiveUser,
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 10000,
    gcTime: 2 * 60 * 1000,
  });

  return {
    history,
    loading: isLoading || isFetching,
    error: error as Error | null,
    refetch: () => { refetch(); },
  };
}
