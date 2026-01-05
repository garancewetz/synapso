import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type UseHistoryReturn = {
  history: HistoryEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook pour récupérer et gérer l'historique des exercices
 * Centralise la logique de récupération de l'historique
 */
export function useHistory(): UseHistoryReturn {
  const { currentUser } = useUser();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(() => {
    if (!currentUser) {
      setLoading(false);
      setHistory([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/history?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error('API error:', data);
          setError(new Error('Format de données invalide'));
          setHistory([]);
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err : new Error('Erreur lors de la récupération de l\'historique');
        console.error('Fetch error:', errorMessage);
        setError(errorMessage);
        setHistory([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}

