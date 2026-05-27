'use client';

import { useQuery } from '@tanstack/react-query';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';
import { PERSISTED_QUERY_GC_TIME } from '@/app/providers/queryPersister';

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

  const referenceDateForQuery = isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;

  const { data: history = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.history.list({ days: days || undefined, referenceDate: referenceDateForQuery }),
    queryFn: () => fetchHistory({ days: days || undefined, referenceDate: referenceDateForQuery }),
    enabled: !!effectiveUser,
    placeholderData: (previousData) => previousData,
    staleTime: 1000,
    // Persisted root: keep gcTime >= persist maxAge so the snapshot survives.
    gcTime: PERSISTED_QUERY_GC_TIME,
  });

  return {
    history,
    loading: isLoading,
    error: error as Error | null,
    refetch: () => { refetch(); },
  };
}
