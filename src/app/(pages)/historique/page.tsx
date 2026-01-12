'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useProgress } from '@/app/hooks/useProgress';
import { useProgressStats } from '@/app/hooks/useProgressStats';
import { 
  DonutChart, 
  ActivityHeatmap, 
  ProgressStatsChart,
  ActivityHeatmapSkeleton 
} from '@/app/components/historique';
import { ProgressBottomSheet, ProgressButton, ConfettiRain } from '@/app/components';
import { BackButton } from '@/app/components/BackButton';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import { SegmentedControl } from '@/app/components/ui';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import {
  calculateBodypartStatsByPeriod,
  getDonutDataBodyparts,
  getLast7DaysData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

type BodypartPeriodFilter = 'week' | 'month' | 'all';

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

  const handleProgressSuccess = () => {
    setShowConfetti(true);
    refetchProgress();
  };

  const {
    progressDates,
    totalProgress,
    totalPhysicalProgress,
    totalOrthoProgress,
  } = useProgressStats(progressList);

  const donutDataBodyparts = useMemo(() => {
    const bodypartStats = calculateBodypartStatsByPeriod(history, bodypartPeriod);
    return getDonutDataBodyparts(bodypartStats);
  }, [history, bodypartPeriod]);

  // Pour la page historique, utiliser getLast7DaysData qui retourne les 7 jours sans jours vides
  const roadmapData = useMemo(() => getLast7DaysData(history), [history]);
  const currentStreak = useMemo(() => calculateCurrentStreak(roadmapData), [roadmapData]);
  
  const handleDayClick = useCallback((day: HeatmapDay) => openDayDetail(day), [openDayDetail]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-8">
      <BackButton 
        className="mb-4" 
        buttonClassName="py-3"
      />

      <div className="px-3 sm:p-6">
        <div className="space-y-6 mb-6">
          <AnimatePresence mode="wait">
            {loadingHistory ? (
              <motion.div
                key="heatmap-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ActivityHeatmapSkeleton daysCount={7} />
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
                  userName={displayName} 
                  progressDates={progressDates}
                  onDayClick={handleDayClick}
                  showFullLink={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 w-full">
            <div className={clsx('flex items-center justify-between mb-2', effectiveUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  {PROGRESS_EMOJIS.STAR_BRIGHT} Mes progrès
                </h2>
                {totalProgress > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {effectiveUser?.isAphasic ? (
                      <>
                        <span className="text-xs font-medium text-gray-500">
                          {totalProgress} au total
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-orange-600">
                          {totalPhysicalProgress} 💪
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-yellow-600">
                          {totalOrthoProgress} 💬
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        {totalProgress} progrès
                      </span>
                    )}
                  </div>
                )}
              </div>
              {effectiveUser && (
                <ProgressButton 
                  onClick={progressModal.openForCreate}
                  variant="inline"
                  label="Ajouter"
                />
              )}
            </div>
            {progressList.length >= 2 ? (
              <ProgressStatsChart 
                progressList={progressList}
                hideTitle={true}
              />
            ) : progressList.length === 1 ? (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">🌟</span>
                <p className="text-gray-700 font-medium mb-1">Ton premier progrès est enregistré !</p>
                <p className="text-gray-500 text-sm">Continue pour voir ton graphique de progression.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">🌟</span>
                <p className="text-gray-500">Tes progrès apparaîtront ici !</p>
              </div>
            )}
            {progressList.length > 0 && (
              <ViewAllLink 
                href="/historique/victories"
                label="Voir tous les progrès"
                emoji={PROGRESS_EMOJIS.STAR_BRIGHT}
              />
            )}
          </div>

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
