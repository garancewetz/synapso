import { useState, useMemo } from 'react';
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

export function useHeatmapNavigation(
  history: HistoryEntry[],
  daysPerPeriod = 30
): HeatmapNavigationResult {
  const [periodOffset, setPeriodOffset] = useState(0);

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
