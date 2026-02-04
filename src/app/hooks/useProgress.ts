import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Progress } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { apiCache, generateCacheKey } from '@/app/utils/api-cache.utils';

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

// Événement personnalisé pour notifier tous les hooks useProgress
const PROGRESS_REFRESH_EVENT = 'progress-refresh';

/**
 * Déclenche un rafraîchissement de tous les hooks useProgress
 * Appelé après l'ajout, la modification ou la suppression d'un progrès
 */
export function triggerProgressRefresh(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_REFRESH_EVENT));
  }
}

/**
 * Hook pour récupérer et gérer les progrès
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const { limit } = options;
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback((forceRefresh = false) => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setProgressList([]);
      setError(null);
      return;
    }

    const url = limit
      ? `/api/progress?limit=${limit}`
      : '/api/progress';

    // ⚡ PERFORMANCE: Vérifier le cache avant de faire la requête (sauf si forceRefresh)
    const cacheKey = generateCacheKey(url, { userId: effectiveUser.id, limit });
    
    if (!forceRefresh) {
      const cachedData = apiCache.get<Progress[]>(cacheKey);
      if (cachedData) {
        setProgressList(cachedData);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

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
          // ⚡ PERFORMANCE: Mettre en cache les données pour 30 secondes
          apiCache.set(cacheKey, data, 30000);
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
  }, [effectiveUser, userLoading, limit]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Écouter les événements de rafraîchissement global
  useEffect(() => {
    const handleRefresh = () => {
      fetchProgress(true);
    };

    window.addEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    };
  }, [fetchProgress]);

  const lastProgress = useMemo(() => {
    return progressList.length > 0 ? progressList[0] : null;
  }, [progressList]);

  const refetch = useCallback(() => {
    fetchProgress(true);
  }, [fetchProgress]);

  return { progressList, loading: loading || userLoading, error, refetch, lastProgress };
}
