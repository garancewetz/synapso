import { useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { isOrthophonieProgress } from '@/app/utils/progress.utils';
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

  // Dates des progrès physiques pour afficher les étoiles
  // IMPORTANT : Utiliser startOfDay pour normaliser comme dans HeatmapDay.dateKey
  const progressDates = useMemo(() => {
    return new Set(
      physicalProgress.map(p => {
        const date = new Date(p.createdAt);
        return format(startOfDay(date), 'yyyy-MM-dd');
      })
    );
  }, [physicalProgress]);

  // Comptage des progrès physiques par jour
  // IMPORTANT : Utiliser startOfDay pour normaliser comme dans HeatmapDay.dateKey
  const progressCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    physicalProgress.forEach(p => {
      const date = new Date(p.createdAt);
      const dateKey = format(startOfDay(date), 'yyyy-MM-dd');
      counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
    });
    return counts;
  }, [physicalProgress]);

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

