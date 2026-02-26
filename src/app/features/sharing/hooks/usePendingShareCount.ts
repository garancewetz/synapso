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
    staleTime: 30 * 1000, // 30 secondes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Polling toutes les minutes pour le badge
  });

  return { count };
}
