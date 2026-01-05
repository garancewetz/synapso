import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Victory } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type UseVictoriesOptions = {
  limit?: number;
};

type UseVictoriesReturn = {
  victories: Victory[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  lastVictory: Victory | null;
};

/**
 * Hook pour récupérer et gérer les victoires
 * Centralise la logique de récupération des victoires
 */
export function useVictories(options: UseVictoriesOptions = {}): UseVictoriesReturn {
  const { currentUser } = useUser();
  const { limit } = options;
  const [victories, setVictories] = useState<Victory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVictories = useCallback(() => {
    if (!currentUser) {
      setLoading(false);
      setVictories([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const url = limit
      ? `/api/victories?userId=${currentUser.id}&limit=${limit}`
      : `/api/victories?userId=${currentUser.id}`;

    fetch(url, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setVictories(data);
        } else {
          console.error('API error:', data);
          setError(new Error('Format de données invalide'));
          setVictories([]);
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err : new Error('Erreur lors de la récupération des victoires');
        console.error('Fetch error:', errorMessage);
        setError(errorMessage);
        setVictories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, limit]);

  useEffect(() => {
    fetchVictories();
  }, [fetchVictories]);

  const lastVictory = useMemo(() => {
    return victories.length > 0 ? victories[0] : null;
  }, [victories]);

  return { victories, loading, error, refetch: fetchVictories, lastVictory };
}

