'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { subDays } from 'date-fns';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type HistoryContextType = {
  /** Liste des entrées d'historique */
  history: HistoryEntry[];
  /** Chargement en cours */
  loading: boolean;
  /** Erreur éventuelle */
  error: Error | null;
  /** Rafraîchir l'historique (à appeler après complétion d'un exercice) */
  refreshHistory: () => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const DEFAULT_DAYS = 40;

export function HistoryProvider({ children }: PropsWithChildren) {
  const { effectiveUser, loading: userLoading } = useUser();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(() => {
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setHistory([]);
      setError(null);
      return;
    }

    const url = `/api/history?since=${encodeURIComponent(subDays(new Date(), DEFAULT_DAYS).toISOString())}`;

    setLoading(true);
    setError(null);

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
  }, [effectiveUser, userLoading]);

  // Charger l'historique au montage et quand l'utilisateur change
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ⚡ PERFORMANCE: Mémoriser la valeur du context
  const contextValue = useMemo<HistoryContextType>(() => ({
    history,
    loading: loading || userLoading,
    error,
    refreshHistory: fetchHistory,
  }), [history, loading, userLoading, error, fetchHistory]);

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
}

/**
 * Hook pour accéder à l'historique
 * Utiliser refreshHistory() après avoir complété/décomplété un exercice
 */
export function useHistoryContext() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
}

