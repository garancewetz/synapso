'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchPendingShareCount } from '@/app/lib/api-queries';

export function usePendingShareCount() {
  const { effectiveUser } = useUser();

  const { data: count = 0 } = useQuery({
    queryKey: queryKeys.shares.count(),
    queryFn: fetchPendingShareCount,
    enabled: !!effectiveUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Polling toutes les 5 minutes
  });

  return { count };
}
