'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { SegmentedControl } from '@/app/components/ui';
import { DonutChart, BarChart, ActivityHeatmap, WeekAccordion } from '@/app/components/historique';
import {
  PERIOD_OPTIONS,
  type PeriodFilter,
} from '@/app/constants/historique.constants';
import {
  calculateStats,
  getDonutDataBodyparts,
  getHeatmapData,
  groupHistoryByWeek,
  calculateCurrentStreak,
  getFilteredStatsCount,
  getPeriodLabel,
  getRewardEmoji,
} from '@/app/utils/historique.utils';

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byBodypart: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
  });
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(['current']));
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('week');
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

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [fetchHistory, currentUser]);


  // Données pour le graphique donut par partie du corps
  const donutDataBodyparts = useMemo(() => {
    return getDonutDataBodyparts(stats.byBodypart);
  }, [stats.byBodypart]);

  // Données pour la heatmap avec catégorie dominante
  const heatmapData = useMemo(() => {
    return getHeatmapData(history);
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

  // Série de jours consécutifs
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(heatmapData);
  }, [heatmapData]);

  // Stats filtrées selon la période
  const filteredStats = useMemo(() => {
    return getFilteredStatsCount(stats, periodFilter);
  }, [periodFilter, stats]);

  // Emoji de récompense
  const rewardEmoji = useMemo(() => {
    return getRewardEmoji(filteredStats);
  }, [filteredStats]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-20">

      {/* En-tête */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mx-4 md:mx-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span>🏅</span> Tes progrès, {displayName}
          </h1>
          <SegmentedControl
            options={PERIOD_OPTIONS}
            value={periodFilter}
            onChange={setPeriodFilter}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold text-emerald-600">{filteredStats}</span>
          <span className="text-gray-500 text-sm">
            exercice{filteredStats > 1 ? 's' : ''} complété{filteredStats > 1 ? 's' : ''}
            {getPeriodLabel(periodFilter)}
          </span>
          {rewardEmoji && <span className="text-xl">{rewardEmoji}</span>}
        </div>

     
      </div>

      <div className="p-3 sm:p-6">

        {/* Graphiques de régularité côte à côte */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Graphique en barres */}
          <BarChart data={heatmapData} currentStreak={currentStreak} />
          {/* Heatmap des tendances */}
          <ActivityHeatmap data={heatmapData} currentStreak={currentStreak} />
        </div>

        {/* Graphiques */}
        <div className="mb-6">
     
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
    </div>
  );
}
