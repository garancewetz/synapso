'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchReceivedShares } from '@/app/lib/api-queries';

export function useReceivedShares() {
  const { effectiveUser } = useUser();

  const { data: shares = [], isLoading, refetch } = useQuery({
    queryKey: queryKeys.shares.received(),
    queryFn: fetchReceivedShares,
    enabled: !!effectiveUser,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return { shares, isLoading, refetch };
}
