import { useState, useMemo } from 'react';
import { subDays, format, startOfDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import type { HistoryEntry } from '@/app/types/history';
import { getHeatmapData } from '@/app/utils/historique.utils';

type HeatmapNavigationResult = {
  heatmapData: HeatmapDay[];
  periodLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  periodOffset: number;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
};

/**
 * Hook personnalisé pour gérer la navigation par périodes de 30 jours pour le heatmap
 * @param history - Historique des exercices
 * @param daysPerPeriod - Nombre de jours par période (par défaut 30)
 * @returns Données et contrôles de navigation
 */
export function useHeatmapNavigation(
  history: HistoryEntry[],
  daysPerPeriod = 30
): HeatmapNavigationResult {
  const { referenceDate, isTimeMachineMode } = useTimeContext();
  const { selectedDate } = useSelectedDate();
  const [periodOffset, setPeriodOffset] = useState(0);

  const navigationData = useMemo(() => {
    // Calculer la date de fin de la période en fonction de l'offset
    // offset = 0 : période actuelle
    // offset = -1 : période précédente (30 jours avant)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let periodEndDate: Date;
    
    if (periodOffset === 0) {
      // Période actuelle
      if (isTimeMachineMode && selectedDate) {
        // ⚡ MODE SABLIER: Vérifier si la date sélectionnée est dans les 7 derniers jours
        const selectedDateNormalized = startOfDay(selectedDate);
        const daysDiff = differenceInDays(today, selectedDateNormalized);
        
        if (daysDiff <= 7) {
          // Date sélectionnée dans la semaine courante : garder "aujourd'hui" comme dernière date
          periodEndDate = today;
        } else {
          // Date sélectionnée plus ancienne : utiliser la date sélectionnée comme dernière date
          periodEndDate = selectedDateNormalized;
        }
      } else {
        // Mode normal : toujours utiliser "aujourd'hui"
        periodEndDate = today;
      }
    } else {
      // Période précédente : utiliser referenceDate pour la cohérence
      periodEndDate = subDays(referenceDate, Math.abs(periodOffset) * daysPerPeriod);
    }
    
    const periodEnd = startOfDay(periodEndDate);
    
    // Calculer les données du heatmap pour cette période
    const heatmapData = getHeatmapData(history, daysPerPeriod, periodEnd);
    
    // Calculer le label de la période
    const periodStartDate = subDays(periodEndDate, daysPerPeriod - 1);
    const labelStart = format(periodStartDate, 'd MMM', { locale: fr });
    const labelEnd = format(periodEndDate, 'd MMM yyyy', { locale: fr });
    const periodLabel = `${labelStart} - ${labelEnd}`;
    
    // Vérifier s'il y a de l'historique dans les périodes précédentes
    const firstHistoryDate = history.length > 0 
      ? new Date(Math.min(...history.map(e => new Date(e.completedAt).getTime())))
      : null;
    
    const hasHistoryBefore = firstHistoryDate 
      ? firstHistoryDate < periodStartDate
      : false;
    
    // On peut avancer si on n'est pas à la période actuelle (offset = 0)
    const canGoForward = periodOffset < 0;
    
    return {
      heatmapData,
      periodLabel: periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1),
      canGoBack: hasHistoryBefore,
      canGoForward,
    };
  }, [history, periodOffset, daysPerPeriod, referenceDate, isTimeMachineMode, selectedDate]);

  const goToPreviousPeriod = () => setPeriodOffset(prev => prev - 1);
  const goToNextPeriod = () => setPeriodOffset(prev => prev + 1);

  return {
    ...navigationData,
    periodOffset,
    goToPreviousPeriod,
    goToNextPeriod,
  };
}
