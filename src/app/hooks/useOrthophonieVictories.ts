import { useState, useEffect, useCallback } from 'react';
import type { Victory } from '@/app/types';
import { ORTHOPHONIE_VICTORY_EMOJI } from '@/app/constants/emoji.constants';

type UseOrthophonieVictoriesReturn = {
  victories: Victory[];
  isLoading: boolean;
  refetch: () => void;
};

/**
 * Hook pour récupérer les victoires orthophonie d'un utilisateur
 */
export function useOrthophonieVictories(userId: number | null): UseOrthophonieVictoriesReturn {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVictories = useCallback(() => {
    if (!userId) {
      setVictories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/victories?userId=${userId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filtrer uniquement les victoires orthophonie (emoji 🎯)
          const orthoVictories = data.filter((v: Victory) => v.emoji === ORTHOPHONIE_VICTORY_EMOJI);
          setVictories(orthoVictories);
        } else {
          setVictories([]);
        }
      })
      .catch(() => {
        setVictories([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    fetchVictories();
  }, [fetchVictories]);

  return {
    victories,
    isLoading,
    refetch: fetchVictories,
  };
}

