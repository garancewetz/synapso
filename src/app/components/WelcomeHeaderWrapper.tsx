'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import WelcomeHeader from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { getCurrentWeekData, getLast7DaysData } from '@/app/utils/historique.utils';
import type { HeatmapDay } from '@/app/utils/historique.utils';

export default function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { currentUser } = useUser();
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

  // Gestion du clic sur une journée du calendrier (pour l'instant, pas de modal)
  const handleDayClick = useCallback((_day: HeatmapDay) => {
    // TODO: Implémenter l'ouverture de la modal de détail de journée
  }, []);

  // Ne pas afficher sur les pages d'ajout/édition d'exercice, sur l'historique, sur les paramètres et sur toutes les pages aphasie
  const hideOnPages = ['/exercice/add', '/exercice/edit', '/aphasie', '/historique', '/settings'];
  const shouldHide = hideOnPages.some(path => pathname?.startsWith(path));

  if (shouldHide) {
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
