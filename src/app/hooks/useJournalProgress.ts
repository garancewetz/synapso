import { useState, useEffect, useCallback } from 'react';
import type { Progress } from '@/app/types';
import { JOURNAL_EMOJI } from '@/app/constants/emoji.constants';

type UseJournalProgressReturn = {
  progressList: Progress[];
  isLoading: boolean;
  refetch: () => void;
};

/**
 * Hook pour récupérer les progrès du journal d'un utilisateur
 * Filtre les progrès avec l'emoji du journal (📔)
 */
export function useJournalProgress(userId: number | null): UseJournalProgressReturn {
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
          // Filtrer uniquement les progrès du journal (emoji 📔)
          const journalProgress = data.filter((p: Progress) => p.emoji === JOURNAL_EMOJI);
          setProgressList(journalProgress);
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

