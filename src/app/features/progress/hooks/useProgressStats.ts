import { useMemo } from 'react';
import { getDateKey } from '@/app/utils/date.utils';
import { isOrthophonieProgress } from '../utils/progress.utils';
import type { Progress } from '@/app/types';

type ProgressStats = {
  physicalProgress: Progress[];
  progressDates: Set<string>;
  progressCountByDate: Map<string, number>;
  totalProgress: number;
  totalPhysicalProgress: number;
  totalOrthoProgress: number;
};

/**
 * Hook personnalisé pour calculer les statistiques des progrès
 * Centralise la logique de filtrage et de comptage des progrès
 */
export function useProgressStats(progressList: Progress[]): ProgressStats {
  // Filtrer les progrès physiques uniquement (pas orthophonie)
  const physicalProgress = useMemo(() => {
    return progressList.filter(p => !isOrthophonieProgress(p.emoji));
  }, [progressList]);

  // Dates des progrès (tous types confondus) pour afficher les étoiles
  // IMPORTANT : Utiliser startOfDay pour normaliser comme dans HeatmapDay.dateKey
  const progressDates = useMemo(() => {
    return new Set(
      progressList
        .map(p => getDateKey(new Date(p.createdAt)))
        .filter((k): k is string => k != null)
    );
  }, [progressList]);

  // Comptage des progrès par jour (tous types confondus)
  // IMPORTANT : Utiliser startOfDay pour normaliser comme dans HeatmapDay.dateKey
  const progressCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    progressList.forEach(p => {
      const dateKey = getDateKey(new Date(p.createdAt));
      if (dateKey) counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
    });
    return counts;
  }, [progressList]);

  // Statistiques totales
  const totalProgress = progressList.length;
  const totalPhysicalProgress = physicalProgress.length;
  const totalOrthoProgress = totalProgress - totalPhysicalProgress;

  return {
    physicalProgress,
    progressDates,
    progressCountByDate,
    totalProgress,
    totalPhysicalProgress,
    totalOrthoProgress,
  };
}

