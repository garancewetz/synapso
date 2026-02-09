import { useState, useMemo } from 'react';
import { subDays, format, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
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
  const [periodOffset, setPeriodOffset] = useState(0);

  const navigationData = useMemo(() => {
    // ⚡ FIX: Le heatmap affiche toujours les 28 derniers jours depuis aujourd'hui
    // même en mode sablier, pour permettre de se situer dans le temps
    // Le jour sélectionné sera mis en évidence visuellement dans ActivityHeatmapCell
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let periodEndDate: Date;
    
    if (periodOffset === 0) {
      // Période actuelle : toujours utiliser "aujourd'hui" comme date de fin
      // même en mode sablier, pour garder le contexte temporel
      periodEndDate = today;
    } else {
      // Période précédente : calculer depuis aujourd'hui
      periodEndDate = subDays(today, Math.abs(periodOffset) * daysPerPeriod);
    }
    
    const periodEnd = startOfDay(periodEndDate);
    
    // Calculer les données du heatmap pour cette période
    // ⚡ NOTE: On utilise history complet (pas filtré) pour afficher tous les jours
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
