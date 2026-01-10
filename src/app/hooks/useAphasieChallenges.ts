import { useState, useEffect, useCallback } from 'react';
import type { AphasieChallenge } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type UseAphasieChallengesReturn = {
  challenges: AphasieChallenge[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook pour récupérer et gérer les challenges aphasie
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useAphasieChallenges(): UseAphasieChallengesReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const [challenges, setChallenges] = useState<AphasieChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChallenges = useCallback(() => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setChallenges([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch('/api/aphasie-challenges', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setChallenges(data);
        } else {
          console.error('API error:', data);
          setError(new Error('Format de données invalide'));
          setChallenges([]);
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err : new Error('Erreur lors de la récupération des challenges');
        console.error('Fetch error:', errorMessage);
        setError(errorMessage);
        setChallenges([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, loading: loading || userLoading, error, refetch: fetchChallenges };
}
