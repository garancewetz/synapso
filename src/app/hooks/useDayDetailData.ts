import { useMemo } from 'react';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import type { ExerciceCategory } from '@/app/types/exercice';

type DayExercise = {
  name: string;
  category: ExerciceCategory;
  completedAt: string;
};

type UseDayDetailDataReturn = {
  exercises: DayExercise[];
  victory: ReturnType<typeof useVictories>['victories'][number] | null;
};

/**
 * Hook pour calculer les exercices et la victoire d'un jour donné
 * Utilisé par le modal de détail du jour
 */
export function useDayDetailData(selectedDay: HeatmapDay | null): UseDayDetailDataReturn {
  const { history } = useHistory();
  const { victories } = useVictories();

  const exercises = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    return history
      .filter(entry => entry.completedAt.split('T')[0] === selectedDay.dateKey)
      .map(entry => ({
        name: entry.exercice.name,
        category: entry.exercice.category!,
        completedAt: entry.completedAt,
      }));
  }, [selectedDay, history]);

  const victory = useMemo(() => {
    if (!selectedDay?.dateKey) return null;
    return victories.find(v => v.createdAt.split('T')[0] === selectedDay.dateKey) || null;
  }, [selectedDay, victories]);

  return { exercises, victory };
}

