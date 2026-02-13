import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { addMonths, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimeContext } from '@/app/contexts/TimeContext';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { HeatmapDay } from '@/app/features/historique';
import type { HistoryEntry } from '@/app/types/history';

type PeriodNavigationResult = {
  barChartData: HeatmapDay[];
  selectedMonthLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  selectedMonthOffset: number;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
};

/**
 * Calcule le nombre de jours d'historique nécessaires pour couvrir la période affichée.
 * Utilise 31 jours par mois (conservateur) + lookahead d'un mois pour canGoBack.
 */
export function getRequiredDaysForMonthOffset(monthOffset: number, daysPerPeriod: number, minDays = 40): number {
  return Math.max(minDays, (Math.abs(monthOffset) + 2) * 31 + daysPerPeriod);
}

export function usePeriodNavigation(
  history: HistoryEntry[],
  daysPerPeriod = 20,
  externalOffset?: { value: number; set: Dispatch<SetStateAction<number>> }
): PeriodNavigationResult {
  const { referenceDate } = useTimeContext();
  const [internalOffset, setInternalOffset] = useState(0);
  const selectedMonthOffset = externalOffset?.value ?? internalOffset;
  const setSelectedMonthOffset = externalOffset?.set ?? setInternalOffset;

  const periodData = useMemo(() => {
    const now = referenceDate;
    const periodEndDate = addMonths(now, selectedMonthOffset);
    const periodEnd = endOfDay(periodEndDate);
    const periodStart = startOfDay(new Date(periodEndDate.getTime() - (daysPerPeriod - 1) * 24 * 60 * 60 * 1000));
    
    const daysInMonth = eachDayOfInterval({ start: periodStart, end: periodEnd });
    
    if (daysInMonth.length === 0) {
      console.error('usePeriodNavigation: eachDayOfInterval returned empty array', {
        periodStart,
        periodEnd,
        selectedMonthOffset,
      });
    }
    
    const monthHistory = history.filter(entry => {
      const entryDate = new Date(entry.completedAt);
      return entryDate >= periodStart && entryDate <= periodEnd;
    });
    
    const heatmapData: HeatmapDay[] = daysInMonth.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayHistory = monthHistory.filter(entry => {
        const entryDate = new Date(entry.completedAt);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });
      
      const isToday = format(day, 'yyyy-MM-dd') === format(referenceDate, 'yyyy-MM-dd');
      const count = dayHistory.length;
      
      const categoryCounts: Partial<Record<ExerciceCategory, number>> = {};
      dayHistory.forEach(entry => {
        const category = entry.exercice.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
      
      const allCategories = Object.keys(categoryCounts) as ExerciceCategory[];
      const sortedCategories = allCategories.sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
      
      return {
        date: day,
        dateKey: format(day, 'yyyy-MM-dd'),
        count,
        dominantCategory: (sortedCategories[0] as ExerciceCategory) || null,
        secondaryCategory: (sortedCategories[1] as ExerciceCategory) || null,
        allCategories,
        isToday,
        isEmpty: count === 0,
      };
    });
    
    const labelStart = format(periodStart, 'd MMM', { locale: fr });
    const labelEnd = format(periodEnd, 'd MMM yyyy', { locale: fr });
    const label = `${labelStart} - ${labelEnd}`;
    
    const hasHistoryBefore = history.some(entry => {
      const entryDate = new Date(entry.completedAt);
      return entryDate < periodStart;
    });
    
    const hasHistoryAfter = selectedMonthOffset < 0;
    
    return {
      barChartData: heatmapData,
      selectedMonthLabel: label.charAt(0).toUpperCase() + label.slice(1),
      canGoBack: hasHistoryBefore,
      canGoForward: hasHistoryAfter,
    };
  }, [history, selectedMonthOffset, daysPerPeriod, referenceDate]);

  const goToPreviousPeriod = () => setSelectedMonthOffset(prev => prev - 1);
  const goToNextPeriod = () => setSelectedMonthOffset(prev => prev + 1);

  return {
    ...periodData,
    selectedMonthOffset,
    goToPreviousPeriod,
    goToNextPeriod,
  };
}
