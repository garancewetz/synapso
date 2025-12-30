'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { HistoryEntry, Victory } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { DonutChart, BarChart, ActivityHeatmap, WeekAccordion, VictoryTimeline, DayDetailModal } from '@/app/components/historique';
import { VictoryBottomSheet, VictoryButton } from '@/app/components';
import { ChevronIcon } from '@/app/components/ui/icons';
import type { HeatmapDay } from '@/app/utils/historique.utils';
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [victories, setVictories] = useState<Victory[]>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
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
  const displayName = currentUser?.name || "";

  // Calcul des statistiques
  const updateStats = useCallback((data: HistoryEntry[]) => {
    const calculatedStats = calculateStats(data);
    setStats(calculatedStats);
  }, []);

  // Fetch de l'historique
  const fetchHistory = useCallback(() => {
    if (!currentUser) return;

    fetch(`/api/history?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          updateStats(data);
        } else {
          console.error('API error:', data);
          setHistory([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setHistory([]);
      });
  }, [updateStats, currentUser]);

  // Fetch des victoires
  const fetchVictories = useCallback(() => {
    if (!currentUser) return;

    fetch(`/api/victories?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVictories(data);
        } else {
          console.error('API error:', data);
          setVictories([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setVictories([]);
      });
  }, [currentUser]);

  // Supprimer une victoire
  const handleDeleteVictory = async (victoryId: number) => {
    try {
      const response = await fetch(`/api/victories/${victoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setVictories(prev => prev.filter(v => v.id !== victoryId));
      }
    } catch (error) {
      console.error('Error deleting victory:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
      fetchVictories();
    }
  }, [fetchHistory, fetchVictories, currentUser]);

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

  // Grouper l'historique par semaine
  const groupedByWeek = useMemo(() => {
    return groupHistoryByWeek(history);
  }, [history]);

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
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-20">
      {/* Bouton retour accueil - uniquement en desktop (mobile a la navigation en bas) */}
      <div className="hidden md:block px-3 sm:px-6 mb-2">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronIcon direction="left" className="w-5 h-5" />
          <span>🏠 Accueil</span>
        </Link>
      </div>

      <div className="p-3 sm:p-6">

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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                🌟 Mes réussites personnelles
              </h2>
              {currentUser && (
                <VictoryButton 
                  onClick={() => setShowVictoryModal(true)}
                  variant="inline"
                  label="Ajouter"
                />
              )}
            </div>
            <VictoryTimeline 
              victories={victories} 
              onDelete={handleDeleteVictory}
              showDelete={true}
            />
          </div>
          
          {/* 3. Ta régularité (30 jours) - Indicateur de persévérance */}
          <BarChart data={barChartData} currentStreak={currentStreak} />
          
          {/* 4. Zones travaillées - Information plus abstraite, moins cruciale pour le moral */}
          <DonutChart
            title="🦴 Zones travaillées"
            data={donutDataBodyparts}
            emptyIcon="💪"
            emptyMessage="Tes zones travaillées apparaîtront ici !"
            fullWidth={true}
            legendPosition="right"
          />
        </div>

        {/* Historique détaillé */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            📋 Ton parcours de BG
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
            groupedByWeek.map(({ weekKey, label, entries }) => (
              <WeekAccordion
                key={weekKey}
                weekKey={weekKey}
                label={label}
                entries={entries}
                isExpanded={expandedWeeks.has(weekKey)}
                onToggle={() => toggleWeek(weekKey)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal de victoire */}
      {currentUser && (
        <VictoryBottomSheet
          isOpen={showVictoryModal}
          onClose={() => setShowVictoryModal(false)}
          onSuccess={fetchVictories}
          userId={currentUser.id}
        />
      )}

      {/* Modal détail d'une journée */}
      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        date={selectedDay?.date || null}
        exercises={selectedDayExercises}
        victory={selectedDayVictory}
      />
    </div>
  );
}
