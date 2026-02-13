import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { subDays, format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { HeatmapDay } from '@/app/features/historique';
import type { HistoryEntry } from '@/app/types/history';
import { getHeatmapData } from '@/app/features/historique';

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
 * Calcule le nombre de jours d'historique nécessaires pour couvrir la période affichée.
 * Le +2 (au lieu de +1) ajoute une période de lookahead pour que canGoBack
 * détecte correctement s'il y a des données au-delà de la période affichée.
 */
export function getRequiredDaysForOffset(periodOffset: number, daysPerPeriod: number, minDays = 40): number {
  return Math.max(minDays, (Math.abs(periodOffset) + 2) * daysPerPeriod);
}

export function useHeatmapNavigation(
  history: HistoryEntry[],
  daysPerPeriod = 30,
  externalOffset?: { value: number; set: Dispatch<SetStateAction<number>> }
): HeatmapNavigationResult {
  const [internalOffset, setInternalOffset] = useState(0);
  const periodOffset = externalOffset?.value ?? internalOffset;
  const setPeriodOffset = externalOffset?.set ?? setInternalOffset;

  const navigationData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let periodEndDate: Date;
    
    if (periodOffset === 0) {
      periodEndDate = today;
    } else {
      periodEndDate = subDays(today, Math.abs(periodOffset) * daysPerPeriod);
    }
    
    const periodEnd = startOfDay(periodEndDate);
    const heatmapData = getHeatmapData(history, daysPerPeriod, periodEnd);
    
    const periodStartDate = subDays(periodEndDate, daysPerPeriod - 1);
    const labelStart = format(periodStartDate, 'd MMM', { locale: fr });
    const labelEnd = format(periodEndDate, 'd MMM yyyy', { locale: fr });
    const periodLabel = `${labelStart} - ${labelEnd}`;
    
    const firstHistoryDate = history.length > 0 
      ? new Date(Math.min(...history.map(e => new Date(e.completedAt).getTime())))
      : null;
    
    const hasHistoryBefore = firstHistoryDate 
      ? firstHistoryDate < periodStartDate
      : false;
    
    const canGoForward = periodOffset < 0;
    
    return {
      heatmapData,
      periodLabel: periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1),
      canGoBack: hasHistoryBefore,
      canGoForward,
    };
  }, [history, periodOffset, daysPerPeriod]);

  const goToPreviousPeriod = () => setPeriodOffset(prev => prev - 1);
  const goToNextPeriod = () => setPeriodOffset(prev => prev + 1);

  return {
    ...navigationData,
    periodOffset,
    goToPreviousPeriod,
    goToNextPeriod,
  };
}
