'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { format, startOfDay } from 'date-fns';
import { WelcomeHeader } from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useHistoryContext } from '@/app/contexts/HistoryContext';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';
import { useProgress } from '@/app/hooks/useProgress';
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
  const displayName = effectiveUser?.name || "";
  const resetFrequency = effectiveUser?.resetFrequency || null;
  
  // Charger l'historique et les victoires pour le calendrier
  const { history } = useHistoryContext();
  const { progressList } = useProgress();

  // Données selon le rythme de l'utilisateur
  const weekData = useMemo(() => {
    const frequency = resetFrequency || 'DAILY';
    return frequency === 'WEEKLY' 
      ? getCurrentWeekData(history)
      : getLast7DaysData(history);
  }, [history, resetFrequency]);

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
