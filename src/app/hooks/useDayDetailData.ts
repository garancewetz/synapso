import { useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
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
  victories: ReturnType<typeof useVictories>['victories'];
};

/**
 * Hook pour calculer les exercices et les victoires d'un jour donné
 * Utilisé par le modal de détail du jour
 * 
 * IMPORTANT: Utilise la même logique de normalisation de date que getHeatmapData
 * pour éviter les décalages dus aux fuseaux horaires
 */
export function useDayDetailData(selectedDay: HeatmapDay | null): UseDayDetailDataReturn {
  const { history } = useHistory();
  const { victories: allVictories } = useVictories();

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

  const victories = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    
    return allVictories.filter(v => {
      // Utiliser la même logique de normalisation pour les victoires
      // v.createdAt est une string ISO depuis l'API
      const victoryDate = new Date(v.createdAt);
      const victoryDateKey = format(startOfDay(victoryDate), 'yyyy-MM-dd');
      return victoryDateKey === selectedDay.dateKey;
    });
  }, [selectedDay, allVictories]);

  return { exercises, victories };
}

