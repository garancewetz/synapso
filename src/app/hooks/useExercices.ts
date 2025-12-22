import { useState, useEffect } from 'react';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';

interface UseExercicesOptions {
  userId?: number;
  category?: ExerciceCategory;
}

interface UseExercicesReturn {
  exercices: Exercice[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  updateExercice: (updatedExercice: Exercice) => void;
}

/**
 * Hook personnalisé pour gérer les exercices
 * Centralise la logique de récupération et de mise à jour des exercices
 */
export function useExercices({ userId, category }: UseExercicesOptions = {}): UseExercicesReturn {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExercices = () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const url = category 
      ? `/api/exercices?userId=${userId}&category=${category}`
      : `/api/exercices?userId=${userId}`;
    
    fetch(url, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la récupération des exercices');
        }
        if (Array.isArray(data)) {
          setExercices(data);
        } else {
          setExercices([]);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        setExercices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExercices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, category]);

  const updateExercice = (updatedExercice: Exercice) => {
    setExercices(prev => prev.map(ex => 
      ex.id === updatedExercice.id ? updatedExercice : ex
    ));
  };

  return {
    exercices,
    loading,
    error,
    refetch: fetchExercices,
    updateExercice,
  };
}
