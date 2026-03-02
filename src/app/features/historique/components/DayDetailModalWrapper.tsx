'use client';

import { useMemo } from 'react';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useDayData, DayDetailModal } from '@/app/features/historique';

const initialStats: Record<ExerciceCategory, number> = {
  UPPER_BODY: 0,
  LOWER_BODY: 0,
  STRETCHING: 0,
  CORE: 0,
};

export function DayDetailModalWrapper() {
  const { selectedDay, closeDayDetail } = useDayDetailModal();
  const { exercises, progress } = useDayData(selectedDay?.dateKey ?? null);
  
  const categoryStats = useMemo(() => {
    if (!exercises.length) {
      return initialStats;
    }

    const newStats: Record<ExerciceCategory, number> = { ...initialStats };
    exercises.forEach(exercise => {
      if (exercise.category && exercise.category in newStats) {
        newStats[exercise.category as ExerciceCategory]++;
      }
    });

    return newStats;
  }, [exercises]);

  return (
    <DayDetailModal
      isOpen={!!selectedDay}
      onClose={closeDayDetail}
      date={selectedDay?.date || null}
      exercises={exercises}
      progress={progress}
      categoryStats={categoryStats}
    />
  );
}
