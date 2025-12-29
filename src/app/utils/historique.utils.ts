import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import {
  startOfWeek,
  startOfMonth,
  isBefore,
  format,
  subDays,
  isSameDay,
  startOfDay,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BODYPART_TO_CATEGORY,
  CATEGORY_CHART_COLORS,
  CATEGORY_ORDER,
  BODYPART_ICONS,
} from '@/app/constants/exercice.constants';
import {
  ROADMAP_PREVIEW_DAYS,
  MAX_BODYPARTS_IN_CHART,
  REWARD_EMOJIS,
} from '@/app/constants/historique.constants';

// ============================================================================
// TYPES
// ============================================================================

export interface Stats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  byBodypart: Record<string, number>;
  byCategory: Record<ExerciceCategory, number>;
}

export interface HeatmapDay {
  date: Date | null;
  dateKey: string;
  count: number;
  dominantCategory: ExerciceCategory | null;
  secondaryCategory: ExerciceCategory | null; // Deuxième catégorie si à égalité ou très proche
  allCategories: ExerciceCategory[]; // Toutes les catégories travaillées ce jour
  isToday: boolean;
  isEmpty: boolean;
}

export interface DonutChartItem {
  name: string;
  value: number;
  icon: string;
  color: string;
  [key: string]: string | number;
}

export interface WeekGroup {
  weekKey: string;
  label: string;
  entries: HistoryEntry[];
}

// ============================================================================
// CALCUL DES STATISTIQUES
// ============================================================================

export function calculateStats(data: HistoryEntry[]): Stats {
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

    // Inclure le jour de début : !isBefore signifie >=
    if (!isBefore(entryDate, startOfWeekDate)) {
      thisWeek++;
    }

    if (!isBefore(entryDate, startOfMonthDate)) {
      thisMonth++;
    }

    // Compter par bodypart
    entry.exercice.bodyparts.forEach(bp => {
      byBodypart[bp.name] = (byBodypart[bp.name] || 0) + 1;
    });

    // Compter par catégorie
    if (entry.exercice.category) {
      byCategory[entry.exercice.category] = (byCategory[entry.exercice.category] || 0) + 1;
    }
  });

  return { total: data.length, thisWeek, thisMonth, byBodypart, byCategory };
}

// ============================================================================
// DONUT CHART - DONNÉES PAR BODYPART
// ============================================================================

export function getDonutDataBodyparts(
  byBodypart: Record<string, number>
): DonutChartItem[] {
  const getBodypartColor = (bodypartName: string, index: number): string => {
    const category = BODYPART_TO_CATEGORY[bodypartName];
    const baseColor = category ? CATEGORY_CHART_COLORS[category] : '#6B7280';
    const opacity = 1 - (index * 0.12);
    return baseColor + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  // Trier d'abord par catégorie selon CATEGORY_ORDER, puis par valeur décroissante
  const sortedBodyparts = Object.entries(byBodypart)
    .filter(([, count]) => count > 0)
    .sort((a, b) => {
      const categoryA = BODYPART_TO_CATEGORY[a[0]] || 'STRETCHING';
      const categoryB = BODYPART_TO_CATEGORY[b[0]] || 'STRETCHING';
      
      // Comparer d'abord par ordre de catégorie
      const indexA = CATEGORY_ORDER.indexOf(categoryA);
      const indexB = CATEGORY_ORDER.indexOf(categoryB);
      
      if (indexA !== indexB) {
        return indexA - indexB;
      }
      
      // Si même catégorie, trier par valeur décroissante
      return b[1] - a[1];
    })
    .slice(0, MAX_BODYPARTS_IN_CHART)
    .map(([name, count], index) => ({
      name,
      value: count,
      icon: BODYPART_ICONS[name] || '⚪',
      color: getBodypartColor(name, index),
    }));

  return sortedBodyparts;
}

// ============================================================================
// HEATMAP - DONNÉES D'ACTIVITÉ
// ============================================================================

// Seuil pour considérer qu'il y a égalité (différence de 1 exercice max)
const EQUALITY_THRESHOLD = 1;

function getDominantCategories(
  byCategory: Record<ExerciceCategory, number>
): { dominant: ExerciceCategory | null; secondary: ExerciceCategory | null } {
  const entries = Object.entries(byCategory) as [ExerciceCategory, number][];
  const maxCount = Math.max(...entries.map(([, count]) => count));
  
  if (maxCount === 0) {
    return { dominant: null, secondary: null };
  }
  
  // Trier par nombre d'exercices décroissant
  const sorted = entries
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  
  if (sorted.length === 0) {
    return { dominant: null, secondary: null };
  }
  
  const dominant = sorted[0][0];
  
  // Si on a au moins 2 catégories et que la deuxième est à égalité ou très proche
  if (sorted.length >= 2) {
    const secondCount = sorted[1][1];
    const difference = maxCount - secondCount;
    
    // Si la différence est <= au seuil, on considère qu'il y a égalité
    if (difference <= EQUALITY_THRESHOLD && secondCount > 0) {
      return {
        dominant,
        secondary: sorted[1][0],
      };
    }
  }
  
  return { dominant, secondary: null };
}

export function getHeatmapData(history: HistoryEntry[], days: number = ROADMAP_PREVIEW_DAYS): HeatmapDay[] {
  const today = new Date();
  const startDate = subDays(today, days - 1);
  const allDays = eachDayOfInterval({ start: startDate, end: today });
  
  // Compter les exercices par jour et par catégorie
  const exercisesByDay: Record<string, {
    count: number;
    byCategory: Record<ExerciceCategory, number>;
  }> = {};
  
  history.forEach(entry => {
    const dateKey = format(startOfDay(new Date(entry.completedAt)), 'yyyy-MM-dd');
    if (!exercisesByDay[dateKey]) {
      exercisesByDay[dateKey] = {
        count: 0,
        byCategory: {
          UPPER_BODY: 0,
          CORE: 0,
          LOWER_BODY: 0,
          STRETCHING: 0,
        },
      };
    }
    exercisesByDay[dateKey].count++;
    if (entry.exercice.category) {
      exercisesByDay[dateKey].byCategory[entry.exercice.category]++;
    }
  });

  // Calculer le décalage pour aligner le premier jour de la semaine
  const firstDayOfWeek = getDay(startDate);
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const emptyDays = Array.from({ length: adjustedFirstDay }, (_, i) => ({
    date: null as Date | null,
    dateKey: `empty-${i}`,
    count: 0,
    dominantCategory: null as ExerciceCategory | null,
    secondaryCategory: null as ExerciceCategory | null,
    allCategories: [] as ExerciceCategory[],
    isToday: false,
    isEmpty: true,
  }));

  const realDays = allDays.map(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayData = exercisesByDay[dateKey];
    const count = dayData?.count || 0;
    const { dominant, secondary } = dayData 
      ? getDominantCategories(dayData.byCategory)
      : { dominant: null, secondary: null };
    
    // Extraire toutes les catégories travaillées ce jour (triées par nombre décroissant)
    const allCategories = dayData 
      ? (Object.entries(dayData.byCategory) as [ExerciceCategory, number][])
          .filter(([, cnt]) => cnt > 0)
          .sort((a, b) => b[1] - a[1])
          .map(([cat]) => cat)
      : [];
    
    return {
      date: day as Date | null,
      dateKey,
      count,
      dominantCategory: dominant,
      secondaryCategory: secondary,
      allCategories,
      isToday: isSameDay(day, today),
      isEmpty: false,
    };
  });

  return [...emptyDays, ...realDays];
}

// ============================================================================
// GROUPEMENT PAR SEMAINE
// ============================================================================

export function groupHistoryByWeek(history: HistoryEntry[]): WeekGroup[] {
  const grouped: Record<string, { label: string; entries: HistoryEntry[] }> = {};
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  
  history.forEach(entry => {
    const entryDate = new Date(entry.completedAt);
    const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 });
    
    let weekKey: string;
    let weekLabel: string;
    
    // Inclure le jour de début : !isBefore signifie >=
    if (!isBefore(entryDate, thisWeekStart)) {
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
    })
    .map(([weekKey, { label, entries }]) => ({
      weekKey,
      label,
      entries,
    }));
}

// ============================================================================
// CALCUL DE LA SÉRIE (STREAK)
// ============================================================================

export function calculateCurrentStreak(heatmapData: HeatmapDay[]): number {
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
}

// ============================================================================
// FORMATAGE DES STATS FILTRÉES
// ============================================================================

export function getFilteredStatsCount(
  stats: Stats,
  periodFilter: 'week' | 'month' | 'total'
): number {
  switch (periodFilter) {
    case 'week':
      return stats.thisWeek;
    case 'month':
      return stats.thisMonth;
    default:
      return stats.total;
  }
}

export function getPeriodLabel(periodFilter: 'week' | 'month' | 'total'): string {
  switch (periodFilter) {
    case 'week':
      return ' cette semaine';
    case 'month':
      return ' ce mois';
    default:
      return ' au total';
  }
}

// ============================================================================
// EMOJIS DE RÉCOMPENSE
// ============================================================================

export function getRewardEmoji(count: number): string | null {
  for (const { threshold, emoji } of REWARD_EMOJIS) {
    if (count >= threshold) {
      return emoji;
    }
  }
  return null;
}

