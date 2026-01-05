'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { DonutChart, BarChart, ActivityHeatmap, WeekAccordion, VictoryStatsChart, DayDetailModal } from '@/app/components/historique';
import { VictoryBottomSheet, VictoryButton, ConfettiRain } from '@/app/components';
import BackButton from '@/app/components/BackButton';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { VICTORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import clsx from 'clsx';
import {
  STATS_DAYS,
  ROADMAP_PREVIEW_DAYS,
} from '@/app/constants/historique.constants';
import {
  calculateStats,
  getDonutDataBodyparts,
  getHeatmapData,
  groupHistoryByWeek,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

export default function HistoriquePage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byBodypart: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
  });
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(['current']));
  const { currentUser } = useUser();
  const victoryModal = useVictoryModal();
  const displayName = currentUser?.name || "";

  // Charger l'historique
  const { history } = useHistory();

  // Charger les victoires
  const { victories, refetch: refetchVictories } = useVictories();

  // Calcul des statistiques à partir de l'historique
  useEffect(() => {
    const calculatedStats = calculateStats(history);
    setStats(calculatedStats);
  }, [history]);

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Handler pour le succès d'une victoire avec confettis dorés
  const handleVictorySuccess = () => {
    setShowConfetti(true);
    refetchVictories();
  };

  // Dates des victoires pour le calendrier
  const victoryDates = useMemo(() => {
    return new Set(victories.map(v => v.createdAt.split('T')[0]));
  }, [victories]);

  // Données pour le graphique donut par partie du corps
  const donutDataBodyparts = useMemo(() => {
    return getDonutDataBodyparts(stats.byBodypart);
  }, [stats.byBodypart]);

  // Données pour le parcours (7 jours)
  const roadmapData = useMemo(() => {
    return getHeatmapData(history, ROADMAP_PREVIEW_DAYS);
  }, [history]);

  // Données pour la régularité (30 jours)
  const barChartData = useMemo(() => {
    return getHeatmapData(history, STATS_DAYS);
  }, [history]);

  // Grouper l'historique et les victoires par semaine
  const groupedByWeek = useMemo(() => {
    return groupHistoryByWeek(history, victories);
  }, [history, victories]);

  const toggleWeek = (weekKey: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  };

  // Série de jours consécutifs (basé sur les 30 jours)
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(barChartData);
  }, [barChartData]);

  // Gestion du clic sur une journée du calendrier
  const handleDayClick = (day: HeatmapDay) => {
    setSelectedDay(day);
  };

  // Exercices du jour sélectionné
  const selectedDayExercises = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    return history
      .filter(entry => entry.completedAt.split('T')[0] === selectedDay.dateKey)
      .map(entry => ({
        name: entry.exercice.name,
        category: entry.exercice.category!,
        completedAt: entry.completedAt,
      }));
  }, [selectedDay, history]);

  // Victoire du jour sélectionné
  const selectedDayVictory = useMemo(() => {
    if (!selectedDay?.dateKey) return null;
    return victories.find(v => v.createdAt.split('T')[0] === selectedDay.dateKey) || null;
  }, [selectedDay, victories]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour accueil */}
      <BackButton 
        className="mb-4" 
        buttonClassName="py-3"
      />

      <div className="px-3 sm:p-6">

        {/* Sections réorganisées pour maximiser la motivation */}
        <div className="space-y-6 mb-6">
          
          {/* 1. Résumé de la semaine - Sentiment d'accomplissement immédiat */}
          <ActivityHeatmap 
            data={roadmapData} 
            currentStreak={currentStreak} 
            userName={displayName} 
            victoryDates={victoryDates}
            onDayClick={handleDayClick}
          />
          
          {/* 2. Mes réussites personnelles - L'humain et le moral au premier plan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 w-full">
            <div className={clsx('flex items-center justify-between mb-4', currentUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                  {VICTORY_EMOJIS.STAR_BRIGHT} Mes réussites
                </h2>
                {victories.length > 0 && (
                  <span className="text-sm font-medium text-gray-600">
                    ({victories.length})
                  </span>
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
                history={history}
                hideTitle={true}
              />
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
          
          {/* 4. Zones travaillées - Information plus abstraite, moins cruciale pour le moral */}
          <DonutChart
            title="🦴 Zones travaillées"
            data={donutDataBodyparts}
            emptyIcon="💪"
            emptyMessage="Tes zones travaillées apparaîtront ici !"
            fullWidth={true}
            legendPosition="right"
          />
          {/* 3. Ta régularité (30 jours) - Indicateur de persévérance */}
          <BarChart data={barChartData} currentStreak={currentStreak} victoryDates={victoryDates} />
          
        </div>

        {/* Historique détaillé */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            {NAVIGATION_EMOJIS.CLIPBOARD} Ton parcours de BG
          </h2>

          {groupedByWeek.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
              <span className="text-4xl mb-3 block">🌱</span>
              <p className="text-gray-600 font-medium">Ton aventure commence maintenant !</p>
              <p className="text-gray-400 text-sm mt-1">
                Complète ton premier exercice pour voir ton historique apparaître ici.
              </p>
            </div>
          ) : (
            groupedByWeek.map(({ weekKey, label, entries, victories: weekVictories }) => (
              <WeekAccordion
                key={weekKey}
                weekKey={weekKey}
                label={label}
                entries={entries}
                victories={weekVictories}
                isExpanded={expandedWeeks.has(weekKey)}
                onToggle={() => toggleWeek(weekKey)}
              />
            ))
          )}
        </div>
      </div>

      {/* Pluie de confettis dorés pour célébrer la victoire */}
      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

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

      {/* Modal détail d'une journée */}
      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        date={selectedDay?.date || null}
        exercises={selectedDayExercises}
        victory={selectedDayVictory}
        onEdit={victoryModal.openForEdit}
      />
    </div>
  );
}
