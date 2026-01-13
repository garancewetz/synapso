'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useProgress } from '@/app/hooks/useProgress';
import { useProgressStats } from '@/app/hooks/useProgressStats';
import { usePeriodNavigation } from '@/app/hooks/usePeriodNavigation';
import { 
  DonutChart, 
  ActivityHeatmap,
  ActivityLineChart,
} from '@/app/components/historique';
import { ProgressBottomSheet, ConfettiRain } from '@/app/components';
import { BackButton } from '@/app/components/BackButton';
import { SegmentedControl, Loader } from '@/app/components/ui';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import { TouchLink } from '@/app/components/TouchLink';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { NAVIGATION_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import {
  calculateBodypartStatsByPeriod,
  getDonutDataBodyparts,
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

type BodypartPeriodFilter = 'week' | 'month' | 'all';

// 30 jours pour le heatmap du mois
const MONTH_HEATMAP_DAYS = 30;

export default function HistoriquePage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [bodypartPeriod, setBodypartPeriod] = useState<BodypartPeriodFilter>('all');
  const { effectiveUser } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const progressModal = useProgressModal();
  const displayName = effectiveUser?.name || "";

  // Charger l'historique
  const { history, loading: loadingHistory } = useHistory();

  // Charger les progrès
  const { progressList, refetch: refetchProgress } = useProgress();

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleProgressSuccess = useCallback(() => {
    setShowConfetti(true);
    refetchProgress();
  }, [refetchProgress]);

  const {
    progressDates,
    progressCountByDate,
  } = useProgressStats(progressList);

  const donutDataBodyparts = useMemo(() => {
    const bodypartStats = calculateBodypartStatsByPeriod(history, bodypartPeriod);
    return getDonutDataBodyparts(bodypartStats);
  }, [history, bodypartPeriod]);

  // Heatmap de 30 jours
  const heatmapData = useMemo(() => getHeatmapData(history, MONTH_HEATMAP_DAYS), [history]);
  const currentStreak = useMemo(() => calculateCurrentStreak(heatmapData), [heatmapData]);
  
  // Navigation par période pour le graphique montagne
  const {
    barChartData,
    selectedMonthLabel,
    canGoBack,
    canGoForward,
    goToPreviousPeriod,
    goToNextPeriod,
  } = usePeriodNavigation(history, 15);

  const handleDayClick = useCallback((day: HeatmapDay) => openDayDetail(day), [openDayDetail]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-8">
      <BackButton 
        className="mb-4" 
        buttonClassName="py-3"
      />

      <div className="px-3 sm:p-6">
        <div className="mb-6">
          <div className={clsx('flex items-center justify-between mb-2', effectiveUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                {NAVIGATION_EMOJIS.MAP} Mon parcours
              </h1>
              <p className="text-gray-500 mt-2">
                Les {MONTH_HEATMAP_DAYS} derniers jours de ton parcours
              </p>
            </div>
          </div>
        </div>

        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader size="large" />
            <p className="text-gray-600 font-medium">
              Chargement de ton historique... 📊
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-6">
          {/* Section 1 : Heatmap d'activité du mois (30 jours) */}
          {!loadingHistory && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <ActivityHeatmap 
                data={heatmapData} 
                currentStreak={currentStreak} 
                userName={displayName} 
                progressDates={progressDates}
                onDayClick={handleDayClick}
                showFullLink={false}
              />
            </motion.div>
          )}

          {/* Section 2 : Graphique montagne (ActivityLineChart) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <PeriodNavigation
              label={selectedMonthLabel}
              onPrevious={goToPreviousPeriod}
              onNext={goToNextPeriod}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
            />

            {!loadingHistory && (
              <motion.div
                key="chart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
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
          </div>

          {/* Section 3 : Graphique des zones travaillées */}
          <DonutChart
            title="🦴 Zones travaillées"
            data={donutDataBodyparts}
            emptyIcon="💪"
            emptyMessage="Tes zones travaillées apparaîtront ici !"
            fullWidth={true}
            legendPosition="right"
            filterSlot={
              <SegmentedControl
                options={[
                  { value: 'week', label: 'Cette semaine' },
                  { value: 'month', label: 'Ce mois-ci' },
                  { value: 'all', label: 'Tout' },
                ]}
                value={bodypartPeriod}
                onChange={(value) => setBodypartPeriod(value as BodypartPeriodFilter)}
                fullWidth
                size="sm"
                variant="filter"
              />
            }
          />
          </div>
        )}

        {/* Bouton "Voir mes progrès" */}
        <div className={clsx('mt-8', effectiveUser?.dominantHand === 'LEFT' ? 'flex justify-start' : 'flex justify-end')}>
          <TouchLink
            href="/historique/progres"
            className={clsx(
              'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
              'border-2 border-amber-300',
              'rounded-full shadow-md hover:shadow-lg hover:scale-105',
              'transition-all duration-200',
              'flex items-center justify-center gap-2',
              'text-amber-950 active:scale-95',
              'px-6 py-3 font-bold text-sm md:text-base'
            )}
          >
            <span className="text-lg">{PROGRESS_EMOJIS.STAR_BRIGHT}</span>
            <span>Voir mes progrès</span>
          </TouchLink>
        </div>
      </div>

      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

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
