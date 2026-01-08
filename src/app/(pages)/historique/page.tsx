'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { useVictoryStats } from '@/app/hooks/useVictoryStats';
import { DonutChart, ActivityHeatmap, VictoryStatsChart } from '@/app/components/historique';
import { VictoryBottomSheet, VictoryButton, ConfettiRain } from '@/app/components';
import { BackButton } from '@/app/components/BackButton';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import { SegmentedControl } from '@/app/components/ui';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { VICTORY_EMOJIS } from '@/app/constants/emoji.constants';
import { ROADMAP_PREVIEW_DAYS } from '@/app/constants/historique.constants';
import {
  calculateBodypartStatsByPeriod,
  getDonutDataBodyparts,
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

type BodypartPeriodFilter = 'week' | 'month' | 'all';

export default function HistoriquePage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [bodypartPeriod, setBodypartPeriod] = useState<BodypartPeriodFilter>('all');
  const { currentUser } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const victoryModal = useVictoryModal();
  const displayName = currentUser?.name || "";

  // Charger l'historique
  const { history } = useHistory();

  // Charger les victoires
  const { victories, refetch: refetchVictories } = useVictories();

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleVictorySuccess = () => {
    setShowConfetti(true);
    refetchVictories();
  };

  const {
    victoryDates,
    totalVictories,
    totalPhysicalVictories,
    totalOrthoVictories,
  } = useVictoryStats(victories);

  const donutDataBodyparts = useMemo(() => {
    const bodypartStats = calculateBodypartStatsByPeriod(history, bodypartPeriod);
    return getDonutDataBodyparts(bodypartStats);
  }, [history, bodypartPeriod]);

  const roadmapData = useMemo(() => getHeatmapData(history, ROADMAP_PREVIEW_DAYS), [history]);
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
          <ActivityHeatmap 
            data={roadmapData} 
            currentStreak={currentStreak} 
            userName={displayName} 
            victoryDates={victoryDates}
            onDayClick={handleDayClick}
          />
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 w-full">
            <div className={clsx('flex items-center justify-between mb-2', currentUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  {VICTORY_EMOJIS.STAR_BRIGHT} Mes réussites
                </h2>
                {totalVictories > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {currentUser?.isAphasic ? (
                      <>
                        <span className="text-xs font-medium text-gray-500">
                          {totalVictories} au total
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-orange-600">
                          {totalPhysicalVictories} 💪
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-medium text-yellow-600">
                          {totalOrthoVictories} 💬
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        {totalVictories} victoire{totalVictories > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {currentUser && (
                <VictoryButton 
                  onClick={victoryModal.openForCreate}
                  variant="inline"
                  label="Ajouter"
                />
              )}
            </div>
            {victories.length >= 2 ? (
              <VictoryStatsChart 
                victories={victories}
                hideTitle={true}
              />
            ) : victories.length === 1 ? (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">🌟</span>
                <p className="text-gray-700 font-medium mb-1">Ta première réussite est enregistrée !</p>
                <p className="text-gray-500 text-sm">Continue pour voir ton graphique de progression.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-3xl mb-2 block">🌟</span>
                <p className="text-gray-500">Tes réussites apparaîtront ici !</p>
              </div>
            )}
            {victories.length > 0 && (
              <ViewAllLink 
                href="/historique/victories"
                label="Voir toutes les réussites"
                emoji={VICTORY_EMOJIS.STAR_BRIGHT}
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
