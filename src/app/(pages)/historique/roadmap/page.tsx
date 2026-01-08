'use client';

import { useCallback, useMemo } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { BackButton } from '@/app/components/BackButton';
import { ActivityHeatmap, ActivityLineChart, StatsCard } from '@/app/components/historique';
import { VictoryBottomSheet } from '@/app/components';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { usePeriodNavigation } from '@/app/hooks/usePeriodNavigation';
import { useVictoryStats } from '@/app/hooks/useVictoryStats';
import { ROADMAP_FULL_DAYS } from '@/app/constants/historique.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
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

  const roadmapData = useMemo(() => getHeatmapData(history, ROADMAP_FULL_DAYS), [history]);
  const currentStreak = useMemo(() => calculateCurrentStreak(roadmapData), [roadmapData]);

  const {
    victoryDates,
    victoryCountByDate,
    totalVictories,
    totalPhysicalVictories,
    totalOrthoVictories,
  } = useVictoryStats(victories);

  const {
    barChartData,
    selectedMonthLabel,
    canGoBack,
    canGoForward,
    goToPreviousPeriod,
    goToNextPeriod,
  } = usePeriodNavigation(history, 15);

  const { daysWithExercises, totalExercises } = useMemo(() => {
    const realDays = roadmapData.filter(day => !day.isEmpty);
    return {
      daysWithExercises: realDays.filter(day => day.count > 0).length,
      totalExercises: realDays.reduce((sum, day) => sum + day.count, 0),
    };
  }, [roadmapData]);

  const handleDayClick = useCallback((day: HeatmapDay) => openDayDetail(day), [openDayDetail]);
  const handleVictorySuccess = useCallback(() => refetchVictories(), [refetchVictories]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-8">
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

      <div className="px-4 md:px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <StatsCard
            value={daysWithExercises}
            label={`jour${daysWithExercises > 1 ? 's' : ''} actif${daysWithExercises > 1 ? 's' : ''}`}
            bgColor="bg-emerald-50"
            textColor="text-emerald-700"
            borderColor="border-emerald-200"
          />

          <StatsCard
            value={totalExercises}
            label={`exercice${totalExercises > 1 ? 's' : ''}`}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-200"
          />
          
          <StatsCard
            value={totalVictories > 0 ? `${totalVictories} 🌟` : '—'}
            label={
              totalVictories > 0 && currentUser?.isAphasic && totalOrthoVictories > 0
                ? `${totalPhysicalVictories}💪 ${totalOrthoVictories}💬`
                : `victoire${totalVictories > 1 ? 's' : ''}`
            }
            bgColor="bg-yellow-50"
            textColor="text-yellow-700"
            borderColor="border-yellow-200"
          />
        </div>
      </div>

      <div className="px-4 md:px-6 mb-6">
        <ActivityHeatmap 
          data={roadmapData} 
          currentStreak={currentStreak} 
          showFullLink={false}
          victoryDates={victoryDates}
          onDayClick={handleDayClick}
        />
      </div>

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

