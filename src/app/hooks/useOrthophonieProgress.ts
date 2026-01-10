import { useState, useEffect, useCallback } from 'react';
import type { Progress } from '@/app/types';
import { ORTHOPHONIE_PROGRESS_EMOJI } from '@/app/constants/emoji.constants';

type UseOrthophonieProgressReturn = {
  progressList: Progress[];
  isLoading: boolean;
  refetch: () => void;
};

/**
 * Hook pour récupérer les progrès orthophonie d'un utilisateur
 */
export function useOrthophonieProgress(userId: number | null): UseOrthophonieProgressReturn {
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(() => {
    if (!userId) {
      setProgressList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/progress?userId=${userId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filtrer uniquement les progrès orthophonie (emoji 🎯)
          const orthoProgress = data.filter((p: Progress) => p.emoji === ORTHOPHONIE_PROGRESS_EMOJI);
          setProgressList(orthoProgress);
        } else {
          setProgressList([]);
        }
      })
      .catch(() => {
        setProgressList([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progressList,
    isLoading,
    refetch: fetchProgress,
  };
}

