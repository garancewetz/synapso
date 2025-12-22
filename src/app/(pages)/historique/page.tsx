'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';
import { CATEGORY_ICONS, CATEGORY_LABELS, BODYPART_ICONS, CATEGORY_CHART_COLORS, BODYPART_TO_CATEGORY } from '@/app/constants/exercice.constants';
import { SegmentedControl } from '@/app/components/ui';
import { StatCard, DonutChart, ActivityHeatmap, WeekAccordion } from '@/app/components/historique';
import type { ExerciceCategory } from '@/app/types/exercice';
import { 
  startOfWeek, 
  startOfMonth, 
  isAfter, 
  isEqual, 
  format, 
  subDays, 
  isSameDay,
  startOfDay,
  eachDayOfInterval,
  getDay
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Constantes
const DAILY_GOAL = 5;

type PeriodFilter = 'week' | 'month' | 'total';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'week', label: '7 jours' },
  { value: 'month', label: 'Mois' },
  { value: 'total', label: 'Total' },
];

// Configuration des badges pour les StatCards
const STAT_BADGES = {
  total: [
    { threshold: 100, text: 'Légende ! 👑' },
    { threshold: 50, text: 'Expert ! ⭐' },
    { threshold: 20, text: 'En progression ! 📈' },
  ],
  week: [
    { threshold: 15, text: 'Semaine parfaite ! 🌟' },
    { threshold: 7, text: 'Super semaine ! 💫' },
  ],
  month: [
    { threshold: 30, text: 'Mois record ! 🎖️' },
    { threshold: 15, text: 'Très bien ! 👏' },
  ],
  streak: [
    { threshold: 7, text: 'Inarrêtable ! 🚀' },
    { threshold: 3, text: 'Continue ! 💪' },
  ],
};

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byBodypart: {} as Record<string, number>,
    byCategory: {} as Record<ExerciceCategory, number>,
  });
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set(['current']));
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('week');
  const { currentUser } = useUser();
  const completedToday = useTodayCompletedCount();
  
  // Calculs pour la barre de progression
  const isLoading = completedToday === null;
  const count = completedToday ?? 0;
  const progress = isLoading ? 0 : Math.min(count / DAILY_GOAL, 1);
  const displayName = currentUser?.name || "";

  // Calcul des statistiques
  const calculateStats = useCallback((data: HistoryEntry[]) => {
    const now = new Date();
    const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
    const startOfMonthDate = startOfMonth(now);

    let thisWeek = 0;
    let thisMonth = 0;
    const byBodypart: Record<string, number> = {};
    const byCategory: Record<ExerciceCategory, number> = {
      LOWER_BODY: 0,
      UPPER_BODY: 0,
      STRETCHING: 0,
      CORE: 0,
    };

    data.forEach(entry => {
      const entryDate = new Date(entry.completedAt);

      if (isAfter(entryDate, startOfWeekDate) || isEqual(entryDate, startOfWeekDate)) {
        thisWeek++;
      }

      if (isAfter(entryDate, startOfMonthDate) || isEqual(entryDate, startOfMonthDate)) {
        thisMonth++;
      }

      entry.exercice.bodyparts.forEach(bp => {
        byBodypart[bp.name] = (byBodypart[bp.name] || 0) + 1;
      });

      if (entry.exercice.category) {
        byCategory[entry.exercice.category] = (byCategory[entry.exercice.category] || 0) + 1;
      }
    });

    setStats({ total: data.length, thisWeek, thisMonth, byBodypart, byCategory });
  }, []);

  // Fetch de l'historique
  const fetchHistory = useCallback(() => {
    if (!currentUser) return;

    fetch(`/api/history?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          calculateStats(data);
        } else {
          console.error('API error:', data);
          setHistory([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setHistory([]);
      });
  }, [calculateStats, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [fetchHistory, currentUser]);

  // Données pour le graphique donut par catégorie
  const donutDataCategories = useMemo(() => {
    return (Object.entries(stats.byCategory) as [ExerciceCategory, number][])
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        name: CATEGORY_LABELS[category],
        value: count,
        icon: CATEGORY_ICONS[category],
        color: CATEGORY_CHART_COLORS[category],
      }));
  }, [stats.byCategory]);

  // Données pour le graphique donut par partie du corps
  const donutDataBodyparts = useMemo(() => {
    const getBodypartColor = (bodypartName: string, index: number): string => {
      const category = BODYPART_TO_CATEGORY[bodypartName];
      const baseColor = category ? CATEGORY_CHART_COLORS[category] : '#6B7280';
      const opacity = 1 - (index * 0.12);
      return baseColor + Math.round(opacity * 255).toString(16).padStart(2, '0');
    };

    return Object.entries(stats.byBodypart)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], index) => ({
        name,
        value: count,
        icon: BODYPART_ICONS[name] || '⚪',
        color: getBodypartColor(name, index),
      }));
  }, [stats.byBodypart]);

  // Données pour la heatmap
  const heatmapData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    
    const countByDay: Record<string, number> = {};
    history.forEach(entry => {
      const dateKey = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
      countByDay[dateKey] = (countByDay[dateKey] || 0) + 1;
    });

    const firstDayOfWeek = getDay(thirtyDaysAgo);
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const emptyDays = Array.from({ length: adjustedFirstDay }, (_, i) => ({
      date: null as Date | null,
      dateKey: `empty-${i}`,
      count: 0,
      isToday: false,
      isEmpty: true,
    }));

    const realDays = days.map(day => ({
      date: day as Date | null,
      dateKey: format(day, 'yyyy-MM-dd'),
      count: countByDay[format(day, 'yyyy-MM-dd')] || 0,
      isToday: isSameDay(day, today),
      isEmpty: false,
    }));

    return [...emptyDays, ...realDays];
  }, [history]);

  // Grouper l'historique par semaine
  const groupedByWeek = useMemo(() => {
    const grouped: Record<string, { label: string; entries: HistoryEntry[] }> = {};
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    
    history.forEach(entry => {
      const entryDate = new Date(entry.completedAt);
      const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 });
      
      let weekKey: string;
      let weekLabel: string;
      
      if (isAfter(entryDate, thisWeekStart) || isEqual(entryDate, thisWeekStart)) {
        weekKey = 'current';
        weekLabel = 'Cette semaine';
      } else {
        weekKey = format(weekStart, 'yyyy-MM-dd');
        weekLabel = `Semaine du ${format(weekStart, 'd MMMM', { locale: fr })}`;
      }
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = { label: weekLabel, entries: [] };
      }
      grouped[weekKey].entries.push(entry);
    });

    return Object.entries(grouped)
      .sort(([keyA], [keyB]) => {
        if (keyA === 'current') return -1;
        if (keyB === 'current') return 1;
        return keyB.localeCompare(keyA);
      });
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
    let streak = 0;
    const today = startOfDay(new Date());
    
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      const day = heatmapData[i];
      if (day.isEmpty) continue;
      
      if (day.count > 0) {
        streak++;
      } else if (day.date && !isSameDay(day.date, today)) {
        break;
      }
    }
    
    return streak;
  }, [heatmapData]);

  // Stats filtrées selon la période
  const filteredStats = useMemo(() => {
    switch (periodFilter) {
      case 'week': return stats.thisWeek;
      case 'month': return stats.thisMonth;
      default: return stats.total;
    }
  }, [periodFilter, stats]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-20">
      {/* Bannière de célébration */}
      {count >= DAILY_GOAL && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 md:mx-6 mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 text-center shadow-lg"
        >
          <span className="text-2xl mr-2">🎉</span>
          <span className="font-bold">Félicitations {displayName} ! Tu as atteint ton objectif du jour !</span>
          <span className="text-2xl ml-2">🎉</span>
        </motion.div>
      )}

      {/* En-tête */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mx-4 md:mx-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center gap-2">
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
            {periodFilter === 'week' && ' cette semaine'}
            {periodFilter === 'month' && ' ce mois'}
            {periodFilter === 'total' && ' au total'}
          </span>
          {filteredStats >= 10 && <span className="text-xl">🎯</span>}
          {filteredStats >= 25 && <span className="text-xl">🌟</span>}
          {filteredStats >= 50 && <span className="text-xl">👑</span>}
        </div>

        {/* Barre de progression du jour */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              🎯 Objectif du jour
            </span>
            <span className="text-sm font-semibold text-gray-700">
              {isLoading ? '...' : `${count} / ${DAILY_GOAL}`}
              {count >= DAILY_GOAL && ' ✅'}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                count >= DAILY_GOAL 
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500' 
                  : 'bg-gradient-to-r from-teal-400 to-emerald-500'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: isLoading ? '0%' : `${progress * 100}%` }}
              transition={{ duration: isLoading ? 0 : 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {/* Stats + Heatmap */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Stats clés */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 h-fit">
            <StatCard
              icon="🏆"
              label="Total"
              value={stats.total}
              colorScheme="purple"
              badge={STAT_BADGES.total}
            />
            <StatCard
              icon="📅"
              label="Cette semaine"
              value={stats.thisWeek}
              colorScheme="blue"
              badge={STAT_BADGES.week}
            />
            <StatCard
              icon="🗓️"
              label="Ce mois"
              value={stats.thisMonth}
              colorScheme="emerald"
              badge={STAT_BADGES.month}
            />
            <StatCard
              icon="🔥"
              label="Série actuelle"
              value={currentStreak}
              unit={currentStreak > 1 ? 'jours' : 'jour'}
              colorScheme="amber"
              badge={STAT_BADGES.streak}
            />
          </div>

          {/* Heatmap */}
          <ActivityHeatmap data={heatmapData} currentStreak={currentStreak} />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <DonutChart
            title="🎯 Tes spécialités"
            data={donutDataCategories}
            emptyIcon="🎨"
            emptyMessage="Tes statistiques apparaîtront ici bientôt !"
          />
          <DonutChart
            title="🦴 Zones travaillées"
            data={donutDataBodyparts}
            emptyIcon="💪"
            emptyMessage="Tes zones travaillées apparaîtront ici !"
          />
        </div>

        {/* Historique détaillé */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            📋 Ton parcours de champion
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
            groupedByWeek.map(([weekKey, { label, entries }]) => (
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
