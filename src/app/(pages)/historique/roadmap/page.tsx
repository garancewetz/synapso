'use client';

import { useCallback, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { BackButton } from '@/app/components/BackButton';
import { 
  ActivityHeatmap, 
  ActivityLineChart, 
  StatsCard,
  ActivityHeatmapSkeleton,
  ActivityLineChartSkeleton
} from '@/app/components/historique';
import { ProgressBottomSheet } from '@/app/components';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useProgress } from '@/app/hooks/useProgress';
import { usePeriodNavigation } from '@/app/hooks/usePeriodNavigation';
import { useProgressStats } from '@/app/hooks/useProgressStats';
import { ROADMAP_FULL_DAYS } from '@/app/constants/historique.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import {
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';
import type { HeatmapDay } from '@/app/utils/historique.utils';

export default function RoadmapPage() {
  const { effectiveUser } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const progressModal = useProgressModal();
  const { history, loading: loadingHistory } = useHistory();
  const { progressList, loading: loadingProgress, refetch: refetchProgress } = useProgress();

  const roadmapData = useMemo(() => getHeatmapData(history, ROADMAP_FULL_DAYS), [history]);
  const currentStreak = useMemo(() => calculateCurrentStreak(roadmapData), [roadmapData]);

  const {
    totalProgress,
    totalPhysicalProgress,
    totalOrthoProgress,
    progressCountByDate,
  } = useProgressStats(progressList);

  const {
    barChartData,
    selectedMonthLabel,
    canGoBack,
    canGoForward,
    goToPreviousPeriod,
    goToNextPeriod,
  } = usePeriodNavigation(history, 15);

  const progressDates = useMemo(() => {
    return new Set(
      progressList.map(progress => 
        format(startOfDay(new Date(progress.createdAt)), 'yyyy-MM-dd')
      )
    );
  }, [progressList]);

  const { daysWithExercises, totalExercises } = useMemo(() => {
    const realDays = roadmapData.filter(day => !day.isEmpty);
    return {
      daysWithExercises: realDays.filter(day => day.count > 0).length,
      totalExercises: realDays.reduce((sum, day) => sum + day.count, 0),
    };
  }, [roadmapData]);

  const handleDayClick = useCallback((day: HeatmapDay) => openDayDetail(day), [openDayDetail]);
  const handleProgressSuccess = useCallback(() => refetchProgress(), [refetchProgress]);

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
            value={totalProgress > 0 ? `${totalProgress} 🌟` : '—'}
            label={
              totalProgress > 0 && effectiveUser?.isAphasic && totalOrthoProgress > 0
                ? `${totalPhysicalProgress}💪 ${totalOrthoProgress}💬`
                : `progrès`
            }
            bgColor="bg-yellow-50"
            textColor="text-yellow-700"
            borderColor="border-yellow-200"
          />
        </div>
      </div>

      <div className="px-4 md:px-6 mb-6">
        <AnimatePresence mode="wait">
          {loadingHistory ? (
            <motion.div
              key="heatmap-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ActivityHeatmapSkeleton />
            </motion.div>
            ) : (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
              <ActivityHeatmap 
                data={roadmapData} 
                currentStreak={currentStreak} 
                showFullLink={false}
                progressDates={progressDates}
                onDayClick={handleDayClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
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

          <AnimatePresence mode="wait">
            {loadingHistory ? (
              <motion.div
                key="chart-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ActivityLineChartSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ActivityLineChart 
                  data={barChartData} 
                  currentStreak={currentStreak} 
                  onDayClick={handleDayClick}
                  showFullLink={false}
                  progressCountByDate={progressCountByDate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {effectiveUser && (
        <ProgressBottomSheet
          isOpen={progressModal.isOpen}
          onClose={progressModal.close}
          onSuccess={handleProgressSuccess}
          userId={effectiveUser.id}
          progressToEdit={progressModal.progressToEdit}
        />
      )}
    </div>
  );
}

