'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ProgressTimeline,
  ProgressStatsChart,
} from '@/app/components/historique';
import { ProgressBottomSheet, ConfettiRain } from '@/app/components';
import { ProgressButton } from '@/app/components/ProgressButton';
import { BackButton } from '@/app/components/BackButton';
import { SegmentedControl, Loader } from '@/app/components/ui';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { NAVIGATION_EMOJIS, PROGRESS_EMOJIS, CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { isOrthophonieProgress } from '@/app/utils/progress.utils';
import { formatProgressForWhatsApp, shareOnWhatsApp } from '@/app/utils/share.utils';
import {
  calculateBodypartStatsByPeriod,
  getDonutDataBodyparts,
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

type BodypartPeriodFilter = 'week' | 'month' | 'all';
type FilterType = 'all' | 'orthophonie' | 'physique';
type ActiveTab = 'statistiques' | 'progres';

// 30 jours pour le heatmap du mois
const MONTH_HEATMAP_DAYS = 30;

export default function HistoriquePage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [bodypartPeriod, setBodypartPeriod] = useState<BodypartPeriodFilter>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('progres');
  const { effectiveUser } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const progressModal = useProgressModal();
  const displayName = effectiveUser?.name || "";
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') as FilterType | null;
  const [filter, setFilter] = useState<FilterType>(filterParam && ['all', 'orthophonie', 'physique'].includes(filterParam) ? filterParam : 'all');

  // Charger l'historique
  const { history, loading: loadingHistory } = useHistory();

  // Charger les progrès
  const { progressList, loading: loadingProgress, refetch: refetchProgress } = useProgress();

  // Synchroniser le filtre avec le paramètre d'URL
  useEffect(() => {
    if (filterParam && ['all', 'orthophonie', 'physique'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [filterParam]);

  // Déterminer l'onglet actif depuis l'URL (progrès par défaut)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#statistiques') {
        setActiveTab('statistiques');
      } else {
        // Par défaut, on affiche les progrès (plus important)
        setActiveTab('progres');
        // Mettre à jour l'URL si pas de hash
        if (!hash) {
          window.history.replaceState({}, '', '#progres');
        }
      }
    }
  }, []);

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

  // Handler pour le partage WhatsApp
  const handleShare = useCallback((progress: typeof progressList[0]) => {
    const message = formatProgressForWhatsApp(progress);
    shareOnWhatsApp(message);
  }, []);

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

  // Filtrer les progrès selon le filtre sélectionné
  const filteredProgress = useMemo(() => {
    const isAphasic = effectiveUser?.isAphasic ?? false;
    
    // Si l'utilisateur n'est pas aphasique, toujours afficher tous les progrès
    if (!isAphasic) {
      return progressList;
    }
    
    // Sinon, appliquer le filtre sélectionné
    if (filter === 'all') {
      return progressList;
    }
    if (filter === 'orthophonie') {
      return progressList.filter(p => p.emoji === '🎯');
    }
    // filter === 'physique'
    return progressList.filter(p => p.emoji !== '🎯');
  }, [progressList, filter, effectiveUser?.isAphasic]);

  const loading = loadingHistory || loadingProgress;
  const STAR_BRIGHT_EMOJI = PROGRESS_EMOJIS?.STAR_BRIGHT || '🌟';

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-8">
      <BackButton 
        className="mb-4" 
        buttonClassName="py-3"
      />

      <div className="px-3 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className={clsx('flex items-center justify-between mb-2', effectiveUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                {NAVIGATION_EMOJIS.MAP} Mon parcours
              </h1>
              <p className="text-gray-500 mt-2">
                Statistiques et progrès de ton parcours de rééducation
              </p>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        {!loading && (
          <div className="mb-6">
            <SegmentedControl
              options={[
                { value: 'progres', label: `${STAR_BRIGHT_EMOJI} Progrès` },
                { value: 'statistiques', label: '📊 Statistiques' },
              ]}
              value={activeTab}
              onChange={(value) => {
                setActiveTab(value as ActiveTab);
                // Mettre à jour l'URL sans recharger la page
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  if (value === 'progres') {
                    url.hash = '#progres';
                  } else {
                    url.hash = '#statistiques';
                  }
                  window.history.replaceState({}, '', url.toString());
                }
              }}
              fullWidth
              size="md"
              variant="navigation"
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader size="large" />
            <p className="text-gray-600 font-medium">
              Chargement de ton parcours... 📊
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'statistiques' ? (
              <motion.div
                key="statistiques"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* SECTION 1 : STATISTIQUES ET GRAPHIQUES */}
                <section id="statistiques" className="space-y-6">

              {/* Heatmap d'activité du mois (30 jours) */}
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

              {/* Graphique montagne (ActivityLineChart) */}
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

              {/* Graphique des zones travaillées */}
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
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="progres"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* SECTION 2 : MES PROGRÈS */}
                <section id="progres" className="space-y-6">
                  <div className={clsx('flex items-center justify-between', effectiveUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span>{STAR_BRIGHT_EMOJI}</span>
                      <span>Mes progrès</span>
                    </h2>
                    {effectiveUser && (
                      <ProgressButton 
                        onClick={progressModal.openForCreate}
                        variant="inline"
                        label="Noter un progrès"
                      />
                    )}
                  </div>

              {/* Graphique encourageant */}
              {!loadingProgress && progressList.length >= 2 && (
                <div>
                  <ProgressStatsChart progressList={progressList} />
                </div>
              )}

              {/* Filtre avec nombre de progrès - affiché uniquement pour les utilisateurs aphasiques */}
              {!loadingProgress && progressList.length > 0 && (effectiveUser?.isAphasic ?? false) && (
                <div>
                  <SegmentedControl
                    options={[
                      {
                        value: 'all',
                        label: 'Tous',
                        icon: STAR_BRIGHT_EMOJI,
                        count: progressList.length
                      },
                      {
                        value: 'orthophonie',
                        label: 'Orthophonie',
                        icon: CATEGORY_EMOJIS.ORTHOPHONIE,
                        count: progressList.filter(p => isOrthophonieProgress(p.emoji)).length
                      },
                      {
                        value: 'physique',
                        label: 'Physique',
                        icon: '🏋️',
                        count: progressList.filter(p => !isOrthophonieProgress(p.emoji)).length
                      }
                    ]}
                    value={filter}
                    onChange={(value) => setFilter(value as FilterType)}
                    fullWidth
                    size="md"
                    variant="filter"
                    showCountBelow
                  />
                </div>
              )}

              {/* Timeline des progrès */}
              <AnimatePresence mode="wait">
                {loadingProgress ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[400px] gap-4"
                  >
                    <Loader size="large" />
                    <p className="text-gray-600 font-medium">
                      Chargement de tes progrès... 🌟
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <ProgressTimeline 
                      progressList={filteredProgress}
                      history={history}
                      onEdit={progressModal.openForEdit}
                      onShare={handleShare}
                    />
                  </motion.div>
                )}
                </AnimatePresence>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Pluie de confettis dorés */}
      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

      {/* Modal de progrès */}
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
