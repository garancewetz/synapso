'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchShareableUsers } from '@/app/lib/api-queries';

export function useShareableUsers() {
  const { effectiveUser } = useUser();

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.shares.users(),
    queryFn: fetchShareableUsers,
    enabled: !!effectiveUser,
    staleTime: 5 * 60 * 1000, // 5 minutes — la liste des users change rarement
  });

  return { users, isLoading };
}
