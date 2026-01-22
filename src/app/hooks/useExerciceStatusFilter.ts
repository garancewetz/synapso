import { useMemo } from 'react';
import type { Exercice, ExerciceStatusFilter } from '@/app/types/exercice';

type UseExerciceStatusFilterOptions = {
  exercices: Exercice[];
  filter: ExerciceStatusFilter;
};

type UseExerciceStatusFilterReturn = {
  filteredExercices: Exercice[];
  completedCount: number;
};

/**
 * Hook pour filtrer les exercices par état (Tous / Non faits / Faits)
 */
export function useExerciceStatusFilter({
  exercices,
  filter,
}: UseExerciceStatusFilterOptions): UseExerciceStatusFilterReturn {
  const filteredExercices = useMemo(() => {
    if (filter === 'all') {
      return exercices;
    }
    if (filter === 'notCompleted') {
      return exercices.filter(e => !e.completed);
    }
    // filter === 'completed'
    return exercices.filter(e => e.completed);
  }, [exercices, filter]);

  const completedCount = useMemo(() => {
    return exercices.filter(e => e.completed).length;
  }, [exercices]);

  return {
    filteredExercices,
    completedCount,
  };
}

