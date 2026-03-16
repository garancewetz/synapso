'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Progress } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchProgress } from '@/app/lib/api-queries';

const PROGRESS_PAGE_SIZE = 20;

type UseProgressInfiniteReturn = {
  progressList: Progress[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

/**
 * Charge les progrès par pages pour éviter des listes trop longues.
 * Premier chargement : 20 progrès ; "Charger plus" ajoute les 20 suivants.
 */
export function useProgressInfinite(): UseProgressInfiniteReturn {
  const { effectiveUser } = useUser();

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [...queryKeys.progress.lists(), { limit: PROGRESS_PAGE_SIZE }],
    queryFn: ({ pageParam }) =>
      fetchProgress({
        limit: PROGRESS_PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PROGRESS_PAGE_SIZE) return undefined;
      return allPages.length * PROGRESS_PAGE_SIZE;
    },
    enabled: !!effectiveUser,
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
    gcTime: 2 * 60 * 1000,
  });

  const progressList = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data?.pages]);

  return {
    progressList,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  };
}
