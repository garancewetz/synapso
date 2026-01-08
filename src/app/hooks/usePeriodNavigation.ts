import { useState, useMemo } from 'react';
import { addMonths, format, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { HeatmapDay } from '@/app/utils/historique.utils';
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
 * Hook personnalisé pour gérer la navigation par périodes de jours
 * @param history - Historique des exercices
 * @param daysPerPeriod - Nombre de jours par période (par défaut 20)
 * @returns Données et contrôles de navigation
 */
export function usePeriodNavigation(
  history: HistoryEntry[],
  daysPerPeriod = 20
): PeriodNavigationResult {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);

  const periodData = useMemo(() => {
    const now = new Date();
    
    // Calculer la période en fonction de l'offset
    const periodEndDate = addMonths(now, selectedMonthOffset);
    const periodEnd = endOfDay(periodEndDate);
    const periodStart = startOfDay(new Date(periodEndDate.getTime() - (daysPerPeriod - 1) * 24 * 60 * 60 * 1000));
    
    // Créer tous les jours de la période
    const daysInMonth = eachDayOfInterval({ start: periodStart, end: periodEnd });
    
    // Filtrer l'historique pour la période sélectionnée
    const monthHistory = history.filter(entry => {
      const entryDate = new Date(entry.completedAt);
      return entryDate >= periodStart && entryDate <= periodEnd;
    });
    
    // Créer les données pour le graphique
    const heatmapData: HeatmapDay[] = daysInMonth.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayHistory = monthHistory.filter(entry => {
        const entryDate = new Date(entry.completedAt);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });
      
      const isToday = format(day, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      const count = dayHistory.length;
      
      // Calculer les catégories
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
    
    // Label de la période
    const labelStart = format(periodStart, 'd MMM', { locale: fr });
    const labelEnd = format(periodEnd, 'd MMM yyyy', { locale: fr });
    const label = `${labelStart} - ${labelEnd}`;
    
    // Vérifier s'il y a de l'historique dans les périodes précédentes/suivantes
    const hasHistoryBefore = history.some(entry => {
      const entryDate = new Date(entry.completedAt);
      return entryDate < periodStart;
    });
    
    const hasHistoryAfter = selectedMonthOffset < 0; // On peut avancer si on n'est pas à la période actuelle
    
    return {
      barChartData: heatmapData,
      selectedMonthLabel: label.charAt(0).toUpperCase() + label.slice(1),
      canGoBack: hasHistoryBefore,
      canGoForward: hasHistoryAfter,
    };
  }, [history, selectedMonthOffset, daysPerPeriod]);

  const goToPreviousPeriod = () => setSelectedMonthOffset(prev => prev - 1);
  const goToNextPeriod = () => setSelectedMonthOffset(prev => prev + 1);

  return {
    ...periodData,
    selectedMonthOffset,
    goToPreviousPeriod,
    goToNextPeriod,
  };
}

