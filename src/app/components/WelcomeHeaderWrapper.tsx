'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { format, startOfDay, differenceInDays } from 'date-fns';
import { getDateKey } from '@/app/utils/date.utils';
import { WelcomeHeader } from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useHistory } from '@/app/hooks/useHistory';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';
import { useProgress } from '@/app/hooks/useProgress';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { getCurrentWeekData, getLast7DaysData } from '@/app/utils/historique.utils';
import type { HeatmapDay } from '@/app/utils/historique.utils';

/**
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
export const WelcomeHeaderWrapper = memo(function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const completedToday = useTodayCompletedCount();
  const { selectedDateKey, selectedDate, isTimeMachineMode } = useSelectedDate();
  const { referenceDate, referenceDateKey } = useTimeContext();
  const displayName = effectiveUser?.name || "";
  const resetFrequency = effectiveUser?.resetFrequency || null;
  
  // Charger l'historique et les victoires pour le calendrier
  // ⚡ FIX: Utiliser useHistory() au lieu de useHistoryContext() pour bénéficier
  // de la mise à jour automatique via TanStack Query après complétion d'exercices
  const { history } = useHistory();
  const { progressList } = useProgress();

  // ⚡ PERFORMANCE: Pré-calculer les dateKeys UNE SEULE FOIS (indexation)
  // ⚡ OPTIMISATION: Utiliser getDateKey() pour éviter la duplication de logique
  const historyDateKeys = useMemo(() => {
    const map = new Map<number, string>();
    history.forEach(entry => {
      if (!map.has(entry.id)) {
        const dateKey = getDateKey(entry.completedAt);
        if (dateKey) {
          map.set(entry.id, dateKey);
        }
      }
    });
    return map;
  }, [history]);

  // ⚡ PERFORMANCE: Filtrer l'historique si en mode sablier
  // ⚡ FIX: Si la date sélectionnée est dans les 7 derniers jours, inclure les exercices d'aujourd'hui
  // pour que la cellule "aujourd'hui" affiche correctement sa couleur dominante
  const filteredHistory = useMemo(() => {
    if (!isTimeMachineMode || !selectedDateKey) {
      return history;
    }
    
    // Vérifier si la date sélectionnée est dans les 7 derniers jours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(selectedDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);
    const daysDiff = differenceInDays(today, selectedDateNormalized);
    const todayKey = getDateKey(today);
    
    // Si la date sélectionnée est dans les 7 derniers jours, inclure les exercices jusqu'à aujourd'hui
    const maxDateKey = daysDiff <= 7 && todayKey ? todayKey : selectedDateKey;
    
    return history.filter(entry => {
      const entryDateKey = historyDateKeys.get(entry.id);
      return entryDateKey && entryDateKey <= maxDateKey;
    });
  }, [history, isTimeMachineMode, selectedDateKey, historyDateKeys]);

  // ⚡ PERFORMANCE: Utiliser une clé stable basée sur la longueur et les IDs triés
  const historyKey = useMemo(() => {
    const sortedIds = filteredHistory.map(h => h.id).sort().join(',');
    return `${filteredHistory.length}-${sortedIds}`;
  }, [filteredHistory]);

  // Données selon le rythme de l'utilisateur
  // ⚡ MODE SABLIER: Déterminer intelligemment la date de fin du heatmap
  // ⚡ RÉACTIVITÉ: Ajouter history dans les dépendances pour garantir la mise à jour immédiate
  const weekData = useMemo(() => {
    const frequency = resetFrequency || 'DAILY';
    
    // ⚡ MODE SABLIER: Déterminer la date de fin du heatmap
    let endDate: Date;
    if (isTimeMachineMode && selectedDate) {
      // Vérifier si la date sélectionnée est dans les 7 derniers jours
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateNormalized = new Date(selectedDate);
      selectedDateNormalized.setHours(0, 0, 0, 0);
      const daysDiff = differenceInDays(today, selectedDateNormalized);
      
      if (daysDiff <= 7) {
        // Date sélectionnée dans la semaine en cours : garder "aujourd'hui" comme dernière date
        endDate = today;
      } else {
        // Date sélectionnée plus ancienne : utiliser la date sélectionnée comme dernière date
        endDate = selectedDateNormalized;
      }
    } else {
      // Mode normal : toujours utiliser "aujourd'hui"
      endDate = new Date();
      endDate.setHours(0, 0, 0, 0);
    }
    
    return frequency === 'WEEKLY' 
      ? getCurrentWeekData(filteredHistory, endDate)
      : getLast7DaysData(filteredHistory, endDate);
  }, [history, historyKey, resetFrequency, isTimeMachineMode, selectedDate, filteredHistory]);

  // ⚡ PERFORMANCE: Utiliser une clé stable basée sur les IDs des progrès
  const progressListKey = useMemo(() => {
    return progressList.map(p => p.id).join(',');
  }, [progressList]);

  // Dates des progrès pour le calendrier
  // IMPORTANT : Utiliser startOfDay pour normaliser comme dans HeatmapDay.dateKey
  const progressDates = useMemo(() => {
    return new Set(
      progressList.map(p => {
        const date = new Date(p.createdAt);
        return format(startOfDay(date), 'yyyy-MM-dd');
      })
    );
  }, [progressListKey]);

  // Gestion du clic sur une journée du calendrier
  const handleDayClick = useCallback((day: HeatmapDay) => {
    openDayDetail(day);
  }, [openDayDetail]);

  // Ne s'afficher que sur la page d'accueil
  const isHomePage = pathname === '/';

  // Ne pas afficher si pas sur la page d'accueil, pas d'utilisateur (page 404, erreurs, etc.)
  if (!isHomePage || !effectiveUser || loading) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 px-3 md:px-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
        resetFrequency={resetFrequency}
        weekData={weekData}
        progressDates={progressDates}
        onDayClick={handleDayClick}
      />
    </div>
  );
});
