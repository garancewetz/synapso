import { useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { useHistory, type HeatmapDay } from '@/app/features/historique';
import { useProgress } from '@/app/features/progress';
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
 * 
 * ⚡ FIX: Utilise useHistory() au lieu de useHistoryContext() pour bénéficier
 * de la mise à jour automatique via TanStack Query après suppression d'exercices
 */
export function useDayDetailData(selectedDay: HeatmapDay | null): UseDayDetailDataReturn {
  // ⚡ FIX: Utiliser useHistory() qui se met à jour automatiquement via TanStack Query
  const { history } = useHistory();
  const { progressList: allProgress } = useProgress();

  const exercises = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    
    const filtered = history
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
    
    // ⚡ DEBUG: Log pour vérifier les données (à retirer après debug)
    if (filtered.length > 0 && selectedDay.dateKey) {
      console.log(`[useDayDetailData] ${selectedDay.dateKey}: ${filtered.length} exercice(s)`, filtered);
    }
    
    return filtered;
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

