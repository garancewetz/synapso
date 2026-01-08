'use client';

import { useCallback, useMemo } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { BackButton } from '@/app/components/BackButton';
import { ActivityHeatmap, ActivityLineChart } from '@/app/components/historique';
import { VictoryBottomSheet, StatBadge } from '@/app/components';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { usePeriodNavigation } from '@/app/hooks/usePeriodNavigation';
import { ROADMAP_FULL_DAYS } from '@/app/constants/historique.constants';
import { NAVIGATION_EMOJIS, VICTORY_EMOJIS } from '@/app/constants/emoji.constants';
import {
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';
import type { HeatmapDay } from '@/app/utils/historique.utils';

export default function RoadmapPage() {
  const { currentUser } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const victoryModal = useVictoryModal();
  const { history } = useHistory();
  const { victories, refetch: refetchVictories } = useVictories();

  // Données pour la roadmap complète (90 jours)
  const roadmapData = useMemo(() => {
    return getHeatmapData(history, ROADMAP_FULL_DAYS);
  }, [history]);

  // Série de jours consécutifs
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(roadmapData);
  }, [roadmapData]);

  // Dates des victoires pour afficher les étoiles sur le calendrier
  const victoryDates = useMemo(() => {
    return new Set(victories.map(v => v.createdAt.split('T')[0]));
  }, [victories]);

  // Comptage des victoires par jour pour le graphique
  const victoryCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    victories.forEach(v => {
      const date = v.createdAt.split('T')[0];
      counts.set(date, (counts.get(date) || 0) + 1);
    });
    return counts;
  }, [victories]);

  // Navigation par périodes de 20 jours
  const {
    barChartData,
    selectedMonthLabel,
    canGoBack,
    canGoForward,
    goToPreviousPeriod,
    goToNextPeriod,
  } = usePeriodNavigation(history, 20);

  // Statistiques du parcours
  const realDays = roadmapData.filter(day => !day.isEmpty);
  const daysWithExercises = realDays.filter(day => day.count > 0).length;
  const totalExercises = realDays.reduce((sum, day) => sum + day.count, 0);
  const totalVictories = victories.length;

  // Gestion du clic sur une journée du calendrier
  const handleDayClick = (day: HeatmapDay) => {
    openDayDetail(day);
  };

  // Handler pour le succès d'une victoire
  const handleVictorySuccess = useCallback(() => {
    refetchVictories();
  }, [refetchVictories]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-24 md:pb-8">
      {/* Header avec bouton retour */}
      <div className="px-4 md:px-6 mb-6">
        <BackButton 
          backHref="/historique" 
          className="mb-4" 
          buttonClassName="py-3"
        />

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
          {NAVIGATION_EMOJIS.MAP} Mon chemin parcouru
        </h1>
        <p className="text-gray-500 mt-2">
          Les {ROADMAP_FULL_DAYS} derniers jours de ton parcours
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="px-4 md:px-6 mb-6">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          <StatBadge
            value={daysWithExercises}
            label="jours actifs"
            bgColorClass="bg-emerald-50"
            textColorClass="text-emerald-600"
            textColorDarkClass="text-emerald-700"
          />
          <StatBadge
            value={totalExercises}
            label="exercices"
            bgColorClass="bg-blue-50"
            textColorClass="text-blue-600"
            textColorDarkClass="text-blue-700"
          />
          <StatBadge
            value={currentStreak}
            label="jours d'affilée"
            bgColorClass="bg-amber-50"
            textColorClass="text-amber-600"
            textColorDarkClass="text-amber-700"
          />
          <StatBadge
            value={totalVictories}
            label="victoires"
            bgColorClass="bg-yellow-50"
            textColorClass="text-yellow-600"
            textColorDarkClass="text-yellow-700"
            emoji={VICTORY_EMOJIS.STAR_BRIGHT}
          />
        </div>
      </div>

      {/* Roadmap complète */}
      <div className="px-4 md:px-6 mb-6">
        <ActivityHeatmap 
          data={roadmapData} 
          currentStreak={currentStreak} 
          showFullLink={false}
          victoryDates={victoryDates}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Chaîne de montagnes - Vue détaillée par période */}
      <div className="px-4 md:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <PeriodNavigation
            label={selectedMonthLabel}
            onPrevious={goToPreviousPeriod}
            onNext={goToNextPeriod}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
          />

          <ActivityLineChart 
            data={barChartData} 
            currentStreak={currentStreak} 
            victoryCountByDate={victoryCountByDate}
            onDayClick={handleDayClick}
            showFullLink={false}
          />
        </div>
      </div>

      {/* Modal de victoire */}
      {currentUser && (
        <VictoryBottomSheet
          isOpen={victoryModal.isOpen}
          onClose={victoryModal.close}
          onSuccess={handleVictorySuccess}
          userId={currentUser.id}
          victoryToEdit={victoryModal.victoryToEdit}
        />
      )}
    </div>
  );
}

