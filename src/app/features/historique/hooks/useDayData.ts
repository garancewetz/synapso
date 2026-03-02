'use client';

import { useMemo } from 'react';
import { getDateKey, getDateKeyUTC } from '@/app/utils/date.utils';
import { useHistory } from './useHistory';
import { useProgress } from '@/app/features/progress';
import {
  getExercisesForDay,
  type DayExercise,
} from '@/app/features/historique/utils/historique.utils';

type UseDayDataReturn = {
  exercises: DayExercise[];
  progress: ReturnType<typeof useProgress>['progressList'];
  loading: boolean;
  error: Error | null;
};

/**
 * Hook pour récupérer directement les données d'une journée spécifique
 * 
 * @param date - Date pour laquelle récupérer les données (Date ou string dateKey 'yyyy-MM-dd')
 * 
 * ⚡ SIMPLICITÉ: Utilise useHistory() et useProgress() existants, puis filtre par date
 * ⚡ PERFORMANCE: Bénéficie du cache TanStack Query des hooks existants
 * 
 * @example
 * ```tsx
 * const { exercises, progress, loading } = useDayData('2026-01-15');
 * // ou
 * const { exercises, progress, loading } = useDayData(new Date('2026-01-15'));
 * ```
 */
export function useDayData(date: Date | string | null): UseDayDataReturn {
  // Normaliser la date en dateKey (string 'yyyy-MM-dd')
  const dateKey = useMemo(() => {
    if (!date) return null;
    
    if (typeof date === 'string') {
      // Vérifier que c'est bien un format dateKey
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(date)) {
        return date;
      }
      // Sinon, essayer de parser
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return getDateKey(parsed);
      }
      return null;
    }
    
    // Date object
    return getDateKey(date);
  }, [date]);
  
  // ⚡ SIMPLICITÉ: Utiliser les hooks existants qui gèrent déjà le cache et la synchronisation
  const { history, loading: historyLoading, error: historyError } = useHistory();
  const { progressList: allProgress, loading: progressLoading } = useProgress();
  
  const exercises = useMemo(
    () => getExercisesForDay(history, dateKey),
    [history, dateKey]
  );
  
  const progress = useMemo(() => {
    if (!dateKey || !allProgress.length) return [];
    return allProgress.filter(p => {
      const progressDateKeyUTC = getDateKeyUTC(p.createdAt);
      return progressDateKeyUTC === dateKey;
    });
  }, [allProgress, dateKey]);
  
  return {
    exercises,
    progress,
    loading: historyLoading || progressLoading,
    error: historyError,
  };
}
