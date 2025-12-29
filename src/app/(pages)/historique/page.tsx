'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { DonutChart, BarChart, ActivityHeatmap, WeekAccordion } from '@/app/components/historique';
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

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [fetchHistory, currentUser]);


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

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-20">

      <div className="p-3 sm:p-6">

        {/* Parcours, zones et régularité - full width */}
        <div className="space-y-6 mb-6">
          {/* Parcours (7 jours) */}
          <ActivityHeatmap data={roadmapData} currentStreak={currentStreak} userName={displayName} />
          
          {/* Zones travaillées */}
          <DonutChart
            title="🦴 Zones travaillées"
            data={donutDataBodyparts}
            emptyIcon="💪"
            emptyMessage="Tes zones travaillées apparaîtront ici !"
            fullWidth={true}
            legendPosition="right"
          />
          
          {/* Graphique en barres (30 jours) */}
          <BarChart data={barChartData} currentStreak={currentStreak} />
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
