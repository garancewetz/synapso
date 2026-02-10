'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { format, startOfDay, differenceInDays, subDays, isBefore } from 'date-fns';
import { WelcomeHeader } from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useHistory } from '@/app/features/historique';
import { useTodayCompletedCount } from '@/app/features/exercices';
import { useProgress } from '@/app/features/progress';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { getCurrentWeekData, getLast7DaysData, type HeatmapDay } from '@/app/features/historique';

/**
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
export const WelcomeHeaderWrapper = memo(function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const completedToday = useTodayCompletedCount();
  const { selectedDate, isTimeMachineMode } = useSelectedDate();
  const displayName = effectiveUser?.name || "";
  const resetFrequency = effectiveUser?.resetFrequency || null;
  
  // Charger l'historique et les victoires pour le calendrier
  // ⚡ FIX: Utiliser useHistory() au lieu de useHistoryContext() pour bénéficier
  // de la mise à jour automatique via TanStack Query après complétion d'exercices
  // ⚡ FIX MODE SABLIER: useHistory charge maintenant les données depuis referenceDate en mode sablier
  const { history } = useHistory();
  const { progressList } = useProgress();

  // ⚡ PERFORMANCE: Filtrer l'historique si en mode sablier
  // ⚡ FIX MODE SABLIER: En mode sablier, on doit inclure toutes les données nécessaires pour la plage affichée
  // Pour le heatmap des 7 derniers jours, on a besoin des données depuis (endDate - 6 jours) jusqu'à endDate
  // ⚡ FIX: Ne pas filtrer l'historique en mode sablier car useHistory charge déjà les bonnes données depuis referenceDate
  const filteredHistory = useMemo(() => {
    // ⚡ FIX MODE SABLIER: useHistory charge déjà les données depuis referenceDate (date sélectionnée ou aujourd'hui)
    // Donc on n'a plus besoin de filtrer, on peut utiliser history directement
    // Le filtrage par date se fait déjà dans getLast7DaysData et getCurrentWeekData
    return history;
  }, [history]);


  // Données selon le rythme de l'utilisateur
  // ⚡ MODE SABLIER: Déterminer intelligemment la date de fin du heatmap
  // ⚡ RÉACTIVITÉ: Utiliser filteredHistory directement pour garantir la mise à jour immédiate
  const weekData = useMemo(() => {
    const frequency = resetFrequency || 'DAILY';
    
    // ⚡ MODE SABLIER: Déterminer la date de fin du heatmap
    let endDate: Date;
    if (isTimeMachineMode && selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateNormalized = new Date(selectedDate);
      selectedDateNormalized.setHours(0, 0, 0, 0);
      
      if (frequency === 'WEEKLY') {
        // ⚡ FIX MODE HEBDOMADAIRE: Afficher la semaine qui contient la date sélectionnée en mode sablier
        // Si on est en mode sablier, on affiche la semaine de la date sélectionnée
        endDate = selectedDateNormalized;
      } else {
        // Mode quotidien : vérifier si la date sélectionnée est dans les 7 derniers jours
        const daysDiff = differenceInDays(today, selectedDateNormalized);
        
        if (daysDiff <= 7) {
          // Date sélectionnée dans les 7 derniers jours : garder "aujourd'hui" comme dernière date
          // ⚡ FIX: S'assurer que la date sélectionnée est incluse dans la plage
          const minStartDate = subDays(today, 6);
          if (isBefore(selectedDateNormalized, minStartDate)) {
            // La date sélectionnée est plus ancienne que les 7 derniers jours depuis aujourd'hui
            // Utiliser la date sélectionnée comme date de fin pour inclure cette date
            endDate = selectedDateNormalized;
          } else {
            // La date sélectionnée est dans les 7 derniers jours, utiliser aujourd'hui comme date de fin
            endDate = today;
          }
        } else {
          // Date sélectionnée plus ancienne : utiliser la date sélectionnée comme dernière date
          endDate = selectedDateNormalized;
        }
      }
    } else {
      // Mode normal : toujours utiliser "aujourd'hui"
      endDate = new Date();
      endDate.setHours(0, 0, 0, 0);
    }
    
    // ⚡ FIX: Utiliser filteredHistory directement pour garantir que toutes les données sont incluses
    return frequency === 'WEEKLY' 
      ? getCurrentWeekData(filteredHistory, endDate)
      : getLast7DaysData(filteredHistory, endDate);
  }, [filteredHistory, resetFrequency, isTimeMachineMode, selectedDate]);

  // Dates des progrès pour le calendrier
  // IMPORTANT : Utiliser startOfDay pour normaliser comme dans HeatmapDay.dateKey
  const progressDates = useMemo(() => {
    return new Set(
      progressList.map(p => {
        const date = new Date(p.createdAt);
        return format(startOfDay(date), 'yyyy-MM-dd');
      })
    );
  }, [progressList]);

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
