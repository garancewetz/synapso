import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Progress } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type UseProgressOptions = {
  limit?: number;
};

type UseProgressReturn = {
  progressList: Progress[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  lastProgress: Progress | null;
};

/**
 * Hook pour récupérer et gérer les progrès
 * Centralise la logique de récupération des progrès
 */
export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { currentUser } = useUser();
  const { limit } = options;
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(() => {
    if (!currentUser) {
      setLoading(false);
      setProgressList([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const url = limit
      ? `/api/progress?userId=${currentUser.id}&limit=${limit}`
      : `/api/progress?userId=${currentUser.id}`;

    fetch(url, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          // Ne pas logger l'erreur 404 comme une erreur critique
          // Elle peut survenir lors du premier chargement si aucun progrès n'existe
          if (res.status === 404) {
            setProgressList([]);
            setError(null);
            setLoading(false);
            return null;
          }
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data === null) return; // Cas 404 géré ci-dessus
        
        if (Array.isArray(data)) {
          setProgressList(data);
        } else {
          console.error('API error:', data);
          setError(new Error('Format de données invalide'));
          setProgressList([]);
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err : new Error('Erreur lors de la récupération des progrès');
        console.error('Fetch error:', errorMessage);
        setError(errorMessage);
        setProgressList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, limit]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const lastProgress = useMemo(() => {
    return progressList.length > 0 ? progressList[0] : null;
  }, [progressList]);

  return { progressList, loading, error, refetch: fetchProgress, lastProgress };
}

