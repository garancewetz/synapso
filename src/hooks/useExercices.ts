import { useState, useEffect } from 'react';
import type { Exercice } from '@/types';
import { ExerciceCategory } from '@/types/exercice';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';
import { isCompletedToday } from '@/utils/resetFrequency.utils';

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
  toggleMockComplete: (id: number) => void;
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
    if (USE_MOCK_DATA) {
      let filtered = MOCK_EXERCICES;
      if (category) {
        filtered = MOCK_EXERCICES.filter(e => e.category === category);
      }
      setExercices(filtered);
      setLoading(false);
      setError(null);
      return;
    }

    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const url = category 
      ? `/api/exercices?userId=${userId}&category=${category}`
      : `/api/exercices?userId=${userId}`;
    
    fetch(url)
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
    if (USE_MOCK_DATA) return;
    setExercices(prev => prev.map(ex => 
      ex.id === updatedExercice.id ? updatedExercice : ex
    ));
  };

  const toggleMockComplete = (id: number) => {
    if (!USE_MOCK_DATA) return;
    const now = new Date();
    setExercices(prev => prev.map(ex => {
      if (ex.id === id) {
        const newCompleted = !ex.completed;
        const newCompletedAt = newCompleted ? now : null;
        const newCompletedToday = newCompleted ? isCompletedToday(newCompletedAt, now) : false;
        return { 
          ...ex, 
          completed: newCompleted, 
          completedAt: newCompletedAt,
          completedToday: newCompletedToday,
        };
      }
      return ex;
    }));
  };

  return {
    exercices,
    loading,
    error,
    refetch: fetchExercices,
    updateExercice,
    toggleMockComplete,
  };
}

