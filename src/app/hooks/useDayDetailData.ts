import { useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { useHistoryContext } from '@/app/contexts/HistoryContext';
import { useProgress } from '@/app/hooks/useProgress';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import type { ExerciceCategory } from '@/app/types/exercice';

type DayExercise = {
  name: string;
  category: ExerciceCategory;
  completedAt: string;
};

type UseDayDetailDataReturn = {
  exercises: DayExercise[];
  progressList: ReturnType<typeof useProgress>['progressList'];
};

/**
 * Hook pour calculer les exercices et les victoires d'un jour donné
 * Utilisé par le modal de détail du jour
 * 
 * IMPORTANT: Utilise la même logique de normalisation de date que getHeatmapData
 * pour éviter les décalages dus aux fuseaux horaires
 */
export function useDayDetailData(selectedDay: HeatmapDay | null): UseDayDetailDataReturn {
  const { history } = useHistoryContext();
  const { progressList: allProgress } = useProgress();

  const exercises = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    
    return history
      .filter(entry => {
        // Utiliser la même logique de normalisation que getHeatmapData
        // pour éviter les problèmes de fuseau horaire
        // entry.completedAt est une string ISO depuis l'API
        const entryDate = new Date(entry.completedAt);
        const entryDateKey = format(startOfDay(entryDate), 'yyyy-MM-dd');
        return entryDateKey === selectedDay.dateKey;
      })
      .map(entry => ({
        name: entry.exercice.name,
        category: entry.exercice.category!,
        completedAt: entry.completedAt,
      }));
  }, [selectedDay, history]);

  const progressList = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    
    return allProgress.filter(p => {
      // Utiliser la même logique de normalisation pour les progrès
      // p.createdAt est une string ISO depuis l'API
      const progressDate = new Date(p.createdAt);
      const progressDateKey = format(startOfDay(progressDate), 'yyyy-MM-dd');
      return progressDateKey === selectedDay.dateKey;
    });
  }, [selectedDay, allProgress]);

  return { exercises, progressList };
}

