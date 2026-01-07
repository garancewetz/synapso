'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import WelcomeHeader from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { getCurrentWeekData, getLast7DaysData } from '@/app/utils/historique.utils';
import type { HeatmapDay } from '@/app/utils/historique.utils';

export default function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { currentUser, loading } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const completedToday = useTodayCompletedCount();
  const displayName = currentUser?.name || "";
  const resetFrequency = currentUser?.resetFrequency || null;
  
  // Charger l'historique et les victoires pour le calendrier
  const { history } = useHistory();
  const { victories } = useVictories();

  // Données selon le rythme de l'utilisateur
  const weekData = useMemo(() => {
    const frequency = resetFrequency || 'DAILY';
    return frequency === 'WEEKLY' 
      ? getCurrentWeekData(history)
      : getLast7DaysData(history);
  }, [history, resetFrequency]);

  // Dates des victoires pour le calendrier
  const victoryDates = useMemo(() => {
    return new Set(victories.map(v => v.createdAt.split('T')[0]));
  }, [victories]);

  // Gestion du clic sur une journée du calendrier
  const handleDayClick = useCallback((day: HeatmapDay) => {
    openDayDetail(day);
  }, [openDayDetail]);

  // Ne pas afficher sur les pages d'ajout/édition d'exercice, sur l'historique, sur les paramètres et sur toutes les pages aphasie
  const hideOnPages = ['/exercice/add', '/exercice/edit', '/aphasie', '/historique', '/settings'];
  const shouldHide = hideOnPages.some(path => pathname?.startsWith(path));

  // Ne pas afficher si pas d'utilisateur (page 404, erreurs, etc.)
  if (shouldHide || !currentUser || loading) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 px-3 md:px-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
        resetFrequency={resetFrequency}
        weekData={weekData}
        victoryDates={victoryDates}
        onDayClick={handleDayClick}
      />
    </div>
  );
}
