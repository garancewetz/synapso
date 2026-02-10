'use client';

import { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { useHistory } from '@/app/features/historique';
import { useProgress, triggerProgressRefresh, useProgressStats, useProgressModal } from '@/app/features/progress';
import { usePeriodNavigation } from '@/app/hooks/usePeriodNavigation';
import { useHeatmapNavigation } from '@/app/hooks/useHeatmapNavigation';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/lib/api-queries';
import { 
  DonutChart, 
  ActivityHeatmap,
  ActivityLineChart,
  ProgressTimeline,
  ProgressStatsChart,
} from '@/app/features/historique';

// ⚡ PERFORMANCE: Charger dynamiquement les composants lourds avec loading
const ProgressBottomSheet = dynamic(
  () => import('@/app/features/progress').then(mod => ({ default: mod.ProgressBottomSheet })),
  { ssr: false, loading: () => null }
);

const ConfettiRain = dynamic(
  () => import('@/app/components/ConfettiRain').then(mod => ({ default: mod.ConfettiRain })),
  { ssr: false, loading: () => null }
);

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false, loading: () => null }
);

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false, loading: () => null }
);
import { BackButton } from '@/app/components/ui/BackButton';
import { SegmentedControl, Loader, Card } from '@/app/components/ui';
import { ProgressButton } from '@/app/components/ui/ProgressButton';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import type { HeatmapDay } from '@/app/features/historique';
import { NAVIGATION_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { formatProgressForWhatsApp } from '@/app/utils/share.utils';
import {
  calculateBodypartStatsByPeriod,
  getDonutDataBodyparts,
  calculateCurrentStreak,
} from '@/app/features/historique';

type BodypartPeriodFilter = 'week' | 'month' | 'all';
type ActiveTab = 'statistiques' | 'progres';

// 28 jours pour le heatmap du mois
const MONTH_HEATMAP_DAYS = 28;

export function HistoriquePageClient() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [bodypartPeriod, setBodypartPeriod] = useState<BodypartPeriodFilter>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('progres');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectiveUser } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const progressModal = useProgressModal();
  const { openForCreate } = progressModal;
  const displayName = effectiveUser?.name || "";

  // Charger l'historique
  const { history, loading: loadingHistory } = useHistory();

  // Charger les progrès
  const { progressList, loading: loadingProgress, refetch: refetchProgress } = useProgress();
  const queryClient = useQueryClient();

  const { selectedDateKey, isTimeMachineMode } = useSelectedDate();
  const { referenceDate } = useTimeContext();

  // ⚡ PERFORMANCE: Utiliser useDeferredValue pour les calculs non critiques
  // Cela permet de rendre l'UI immédiatement et de différer les calculs lourds
  const deferredHistory = useDeferredValue(history);
  const deferredProgressList = useDeferredValue(progressList);

  // ⚡ PERFORMANCE: Pré-calculer les dateKeys UNE SEULE FOIS (indexation)
  // Utiliser deferredHistory pour différer les calculs lourds
  const historyDateKeys = useMemo(() => {
    const map = new Map<number, string>(); // Cache des dateKeys par ID
    deferredHistory.forEach(entry => {
      if (!map.has(entry.id)) {
        const date = new Date(entry.completedAt);
        date.setHours(0, 0, 0, 0);
        map.set(entry.id, date.toISOString().split('T')[0]);
      }
    });
    return map;
  }, [deferredHistory]);

  // ⚡ PERFORMANCE: Filtrer avec comparaison de strings (ultra-rapide, pas de format() dans le filtre)
  const filteredHistory = useMemo(() => {
    if (!isTimeMachineMode || !selectedDateKey) {
      return deferredHistory;
    }
    return deferredHistory.filter(entry => {
      const entryDateKey = historyDateKeys.get(entry.id);
      return entryDateKey && entryDateKey <= selectedDateKey;
    });
  }, [deferredHistory, isTimeMachineMode, selectedDateKey, historyDateKeys]);

  // ⚡ PERFORMANCE: Pré-calculer les dateKeys pour les progrès
  const progressDateKeys = useMemo(() => {
    const map = new Map<number, string>();
    deferredProgressList.forEach(progress => {
      if (!map.has(progress.id)) {
        const date = new Date(progress.createdAt);
        date.setHours(0, 0, 0, 0);
        map.set(progress.id, date.toISOString().split('T')[0]);
      }
    });
    return map;
  }, [deferredProgressList]);

  // Filtrer les progrès par date sélectionnée (optimisé)
  const filteredProgress = useMemo(() => {
    if (!isTimeMachineMode || !selectedDateKey) {
      return deferredProgressList;
    }
    return deferredProgressList.filter(progress => {
      const progressDateKey = progressDateKeys.get(progress.id);
      return progressDateKey && progressDateKey <= selectedDateKey;
    });
  }, [deferredProgressList, isTimeMachineMode, selectedDateKey, progressDateKeys]);


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
    // ⚡ TANSTACK QUERY: Invalider les queries concernées
    queryClient.invalidateQueries({ queryKey: queryKeys.progress.all });
    triggerProgressRefresh();
    refetchProgress();
  }, [queryClient, refetchProgress]);

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
  } = useProgressStats(deferredProgressList);

  const donutDataBodyparts = useMemo(() => {
    const bodypartStats = calculateBodypartStatsByPeriod(filteredHistory, bodypartPeriod);
    return getDonutDataBodyparts(bodypartStats);
  }, [filteredHistory, bodypartPeriod]);
  
  // ⚡ PERFORMANCE: Utiliser TimeContext pour la date de référence (déjà calculée et mémorisée)
  
  // ⚡ FIX: Le heatmap affiche toujours les 28 derniers jours depuis aujourd'hui
  // même en mode sablier, pour permettre de se situer dans le temps
  // Le jour sélectionné sera mis en évidence visuellement dans ActivityHeatmapCell
  // ⚡ PERFORMANCE: Utiliser deferredHistory pour différer les calculs lourds du heatmap
  const {
    heatmapData,
    periodLabel: heatmapPeriodLabel,
    canGoBack: canGoBackHeatmap,
    canGoForward: canGoForwardHeatmap,
    goToPreviousPeriod: goToPreviousHeatmapPeriod,
    goToNextPeriod: goToNextHeatmapPeriod,
  } = useHeatmapNavigation(deferredHistory, MONTH_HEATMAP_DAYS);
  
  const currentStreak = useMemo(() => calculateCurrentStreak(heatmapData, referenceDate), [heatmapData, referenceDate]);

  // Navigation par période pour le graphique montagne
  // ⚡ PERFORMANCE: Utiliser filteredHistory (déjà calculé) pour éviter les recalculs
  const {
    barChartData,
    selectedMonthLabel,
    canGoBack,
    canGoForward,
    goToPreviousPeriod,
    goToNextPeriod,
  } = usePeriodNavigation(filteredHistory, 15);

  const handleDayClick = useCallback((day: HeatmapDay) => openDayDetail(day), [openDayDetail]);

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
                // ⚡ FIX: Préserver le paramètre date lors du changement d'onglet
                const params = new URLSearchParams(searchParams.toString());
                const hash = value === 'progres' ? '#progres' : '#statistiques';
                const newUrl = params.toString() 
                  ? `${window.location.pathname}?${params.toString()}${hash}`
                  : `${window.location.pathname}${hash}`;
                router.replace(newUrl);
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

              {/* Heatmap d'activité du mois (28 jours) */}
              {!loadingHistory && (
                <Card variant="default" padding="md">
                  <PeriodNavigation
                    label={heatmapPeriodLabel}
                    onPrevious={goToPreviousHeatmapPeriod}
                    onNext={goToNextHeatmapPeriod}
                    canGoBack={canGoBackHeatmap}
                    canGoForward={canGoForwardHeatmap}
                  />
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
                </Card>
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
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <span>{STAR_BRIGHT_EMOJI}</span>
                      <span>Mes progrès</span>
                    </h2>
                    {/* Bouton + doré pour ajouter un progrès */}
                    {effectiveUser && (
                      <button
                        onClick={() => progressModal.openForCreate()}
                        className={clsx(
                          'flex items-center justify-center',
                          'w-10 h-10 rounded-full',
                          'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
                          'text-amber-900 font-bold text-xl',
                          'shadow-md hover:shadow-lg',
                          'transition-all duration-200',
                          'hover:scale-105 active:scale-95',
                          'border-2 border-amber-600',
                          'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2'
                        )}
                        aria-label="Ajouter un progrès"
                      >
                        +
                      </button>
                    )}
                  </div>

              {/* Graphique encourageant */}
              {!loadingProgress && deferredProgressList.length >= 2 && (
                <div>
                  <ProgressStatsChart progressList={deferredProgressList} />
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
                      history={filteredHistory}
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
