'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useProgress, triggerProgressRefresh } from '@/app/hooks/useProgress';
import { useProgressStats } from '@/app/hooks/useProgressStats';
import { usePeriodNavigation } from '@/app/hooks/usePeriodNavigation';
import { apiCache } from '@/app/utils/api-cache.utils';
import { 
  DonutChart, 
  ActivityHeatmap,
  ActivityLineChart,
  ProgressTimeline,
  ProgressStatsChart,
} from '@/app/components/historique';

// ⚡ PERFORMANCE: Charger dynamiquement les composants lourds
const ProgressBottomSheet = dynamic(
  () => import('@/app/components/ProgressBottomSheet').then(mod => ({ default: mod.ProgressBottomSheet })),
  { ssr: false }
);


const ConfettiRain = dynamic(
  () => import('@/app/components/ConfettiRain').then(mod => ({ default: mod.ConfettiRain })),
  { ssr: false }
);

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);
import { BackButton } from '@/app/components/ui/BackButton';
import { SegmentedControl, Loader, Card } from '@/app/components/ui';
import { ProgressButton } from '@/app/components/ui/ProgressButton';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { NAVIGATION_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { formatProgressForWhatsApp } from '@/app/utils/share.utils';
import {
  calculateBodypartStatsByPeriod,
  getDonutDataBodyparts,
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

type BodypartPeriodFilter = 'week' | 'month' | 'all';
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
  const { openForCreate } = progressModal;
  const displayName = effectiveUser?.name || "";

  // Charger l'historique
  const { history, loading: loadingHistory } = useHistory();

  // Charger les progrès
  const { progressList, loading: loadingProgress, refetch: refetchProgress } = useProgress();


  // Déterminer l'onglet actif depuis l'URL (progrès par défaut)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Vérifier si on doit ouvrir le modal de création de progrès
      if (searchParams.get('action') === 'add-progress') {
        openForCreate();
        // Nettoyer l'URL
        window.history.replaceState({}, '', window.location.pathname + (hash || '#progres'));
      }
      
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
  }, [openForCreate]);

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleProgressSuccess = useCallback(() => {
    setShowConfetti(true);
    // Invalider le cache des progrès pour forcer le rafraîchissement
    apiCache.invalidateByPrefix('/api/progress');
    // Notifier tous les hooks useProgress pour qu'ils se rafraîchissent
    triggerProgressRefresh();
    refetchProgress();
  }, [refetchProgress]);

  // Handler pour le partage (optionnel, le partage est déjà géré par useShareProgress dans ProgressCard)
  const handleShare = useCallback(async (progress: typeof progressList[0]) => {
    // L'API Web Share permet de choisir entre Mail, Messages, WhatsApp, etc.
    if (navigator.share) {
      try {
        const message = formatProgressForWhatsApp(progress);
        await navigator.share({
          text: message,
          title: 'Mon progrès sur Synapso',
        });
      } catch {
        // Si l'utilisateur annule ou si le partage échoue, ne rien faire
      }
    }
    // Sinon, le partage est déjà géré par useShareProgress dans ProgressCard
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

  // Tous les progrès (plus de filtre orthophonie)
  const filteredProgress = useMemo(() => {
    return progressList;
  }, [progressList]);

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
                {NAVIGATION_EMOJIS.ROCKET} Ma progression
              </h1>
              <p className="text-gray-500 mt-2">
                Statistiques et progrès de ta progression de rééducation
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
              Chargement de ta progression... 📊
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'statistiques' ? (
              <MotionDiv
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
                <MotionDiv
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
                </MotionDiv>
              )}

              {/* Graphique montagne (ActivityLineChart) */}
              <Card variant="default" padding="md">
                <PeriodNavigation
                  label={selectedMonthLabel}
                  onPrevious={goToPreviousPeriod}
                  onNext={goToNextPeriod}
                  canGoBack={canGoBack}
                  canGoForward={canGoForward}
                />

                {!loadingHistory && (
                  <MotionDiv
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
                  </MotionDiv>
                )}
              </Card>

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
              </MotionDiv>
            ) : (
              <MotionDiv
                key="progres"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pb-24"
              >
                {/* SECTION 2 : MES PROGRÈS */}
                <section id="progres" className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>{STAR_BRIGHT_EMOJI}</span>
                    <span>Mes progrès</span>
                  </h2>

              {/* Graphique encourageant */}
              {!loadingProgress && progressList.length >= 2 && (
                <div>
                  <ProgressStatsChart progressList={progressList} />
                </div>
              )}


              {/* Timeline des progrès */}
              <AnimatePresence mode="wait">
                {loadingProgress ? (
                  <MotionDiv
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
                  </MotionDiv>
                ) : (
                  <MotionDiv
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
                  </MotionDiv>
                )}
                </AnimatePresence>

                {/* Bouton "Noter un progrès" centré sous les cartes */}
                {effectiveUser && (
                  <div className="flex justify-center pt-4">
                    <ProgressButton 
                      onClick={() => progressModal.openForCreate()}
                      variant="inline"
                      label="Noter un progrès"
                    />
                  </div>
                )}
                </section>
              </MotionDiv>
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
