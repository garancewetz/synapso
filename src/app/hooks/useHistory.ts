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
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useHistory(): UseHistoryReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(() => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setHistory([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch('/api/history', { credentials: 'include' })
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
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading: loading || userLoading, error, refetch: fetchHistory };
}
