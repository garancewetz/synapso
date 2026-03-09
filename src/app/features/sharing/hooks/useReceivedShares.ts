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
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Polling toutes les 5 minutes
    refetchOnWindowFocus: true,
  });

  return { shares, isLoading, refetch };
}
