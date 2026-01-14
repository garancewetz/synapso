import { useState, useEffect, useCallback } from 'react';
import { subDays } from 'date-fns';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type UseHistoryOptions = {
  /**
   * Nombre de jours à charger depuis aujourd'hui (par défaut: 40 jours)
   * Passer null pour charger tout l'historique
   */
  days?: number | null;
};

type UseHistoryReturn = {
  history: HistoryEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook pour récupérer et gérer l'historique des exercices
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 * 
 * ⚡ PERFORMANCE: Par défaut, charge seulement les 40 derniers jours pour réduire
 * le transfert de données. Passer days={null} pour charger tout l'historique.
 */
export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { days = 40 } = options;
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

    // ⚡ PERFORMANCE: Filtrer côté serveur avec le paramètre `since` pour réduire le transfert
    // Par défaut, charger seulement les 40 derniers jours
    const url = days !== null 
      ? `/api/history?since=${encodeURIComponent(subDays(new Date(), days).toISOString())}`
      : '/api/history';

    fetch(url, { credentials: 'include' })
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
  }, [effectiveUser, userLoading, days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading: loading || userLoading, error, refetch: fetchHistory };
}
