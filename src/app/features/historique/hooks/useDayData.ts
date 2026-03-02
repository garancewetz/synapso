'use client';

import { useMemo } from 'react';
import { getDateKey } from '@/app/utils/date.utils';
import { useHistory } from './useHistory';
import { useProgress } from '@/app/features/progress';
import type { ExerciceCategory } from '@/app/types/exercice';

type DayExercise = {
  name: string;
  category: ExerciceCategory;
  completedAt: string;
};

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
  
  // Filtrer les exercices pour cette date
  const exercises = useMemo(() => {
    if (!dateKey || !history.length) return [];

    const filtered = history
      .filter(entry => {
        // Utiliser la même logique de normalisation que getHeatmapData
        // pour éviter les problèmes de fuseau horaire
        const entryDate = new Date(entry.completedAt);
        const entryDateKey = getDateKey(entryDate);
        return entryDateKey === dateKey;
      })
      .map(entry => ({
        name: entry.exercice.name,
        category: entry.exercice.category!,
        completedAt: entry.completedAt,
      }));

    return filtered;
  }, [history, dateKey]);
  
  // Filtrer les progrès pour cette date
  const progress = useMemo(() => {
    if (!dateKey || !allProgress.length) return [];
    
    return allProgress.filter(p => {
      // Utiliser la même logique de normalisation pour les progrès
      const progressDate = new Date(p.createdAt);
      const progressDateKey = getDateKey(progressDate);
      return progressDateKey === dateKey;
    });
  }, [allProgress, dateKey]);
  
  return {
    exercises,
    progress,
    loading: historyLoading || progressLoading,
    error: historyError,
  };
}
