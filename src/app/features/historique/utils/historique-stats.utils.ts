import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { startOfWeek, startOfMonth, isBefore } from 'date-fns';
import type { Stats } from './historique.types';

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
    FACE: 0,
  };

  data.forEach(entry => {
    const entryDate = new Date(entry.completedAt);

    if (!isBefore(entryDate, startOfWeekDate)) {
      thisWeek++;
    }

    if (!isBefore(entryDate, startOfMonthDate)) {
      thisMonth++;
    }

    entry.exercice.bodyparts.forEach(bp => {
      byBodypart[bp.name] = (byBodypart[bp.name] || 0) + 1;
    });

    if (entry.exercice.category) {
      byCategory[entry.exercice.category] = (byCategory[entry.exercice.category] || 0) + 1;
    }
  });

  return { total: data.length, thisWeek, thisMonth, byBodypart, byCategory };
}

export function calculateBodypartStatsByPeriod(
  data: HistoryEntry[],
  period: 'week' | 'month' | 'all'
): Record<string, number> {
  const now = new Date();
  const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
  const startOfMonthDate = startOfMonth(now);
  const byBodypart: Record<string, number> = {};

  data.forEach(entry => {
    const entryDate = new Date(entry.completedAt);

    let includeEntry = false;
    if (period === 'all') {
      includeEntry = true;
    } else if (period === 'week' && !isBefore(entryDate, startOfWeekDate)) {
      includeEntry = true;
    } else if (period === 'month' && !isBefore(entryDate, startOfMonthDate)) {
      includeEntry = true;
    }

    if (includeEntry) {
      entry.exercice.bodyparts.forEach(bp => {
        byBodypart[bp.name] = (byBodypart[bp.name] || 0) + 1;
      });
    }
  });

  return byBodypart;
}

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
