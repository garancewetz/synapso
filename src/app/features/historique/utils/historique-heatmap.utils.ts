import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { subDays, isSameDay, startOfDay, eachDayOfInterval, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { getDateKey } from '@/app/utils/date.utils';
import { ROADMAP_PREVIEW_DAYS } from '@/app/constants/historique.constants';
import type { HeatmapDay } from './historique.types';

const EQUALITY_THRESHOLD = 1;

function getDominantCategories(
  byCategory: Record<ExerciceCategory, number>
): { dominant: ExerciceCategory | null; secondary: ExerciceCategory | null } {
  const entries = Object.entries(byCategory) as [ExerciceCategory, number][];
  const maxCount = Math.max(...entries.map(([, count]) => count));

  if (maxCount === 0) {
    return { dominant: null, secondary: null };
  }

  const sorted = entries
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return { dominant: null, secondary: null };
  }

  const dominant = sorted[0][0];

  if (sorted.length >= 2) {
    const secondCount = sorted[1][1];
    const difference = maxCount - secondCount;

    if (difference <= EQUALITY_THRESHOLD && secondCount > 0) {
      return {
        dominant,
        secondary: sorted[1][0],
      };
    }
  }

  return { dominant, secondary: null };
}

export function getHeatmapData(history: HistoryEntry[], days: number = ROADMAP_PREVIEW_DAYS, endDate?: Date): HeatmapDay[] {
  const today = new Date();
  const referenceEndDate = endDate || today;
  const startDate = subDays(referenceEndDate, days - 1);
  const allDays = eachDayOfInterval({ start: startDate, end: referenceEndDate });

  const dateKeysInRange = new Set(allDays.map(day => getDateKey(day) ?? ''));

  const exercisesByDay: Record<string, {
    count: number;
    byCategory: Record<ExerciceCategory, number>;
  }> = {};

  history.forEach(entry => {
    const dateKey = getDateKey(entry.completedAt);

    if (dateKey && dateKeysInRange.has(dateKey)) {
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
    }
  });

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
    const dateKey = getDateKey(day) ?? '';
    const dayData = exercisesByDay[dateKey];
    const count = dayData?.count || 0;
    const { dominant, secondary } = dayData
      ? getDominantCategories(dayData.byCategory)
      : { dominant: null, secondary: null };

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

export function getLast7DaysData(history: HistoryEntry[], referenceDate?: Date): HeatmapDay[] {
  const endDate = referenceDate || new Date();
  const realToday = new Date();
  const startDate = subDays(endDate, 6);
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  const dateKeys = new Set(allDays.map(day => getDateKey(day) ?? ''));

  const exercisesByDay: Record<string, {
    count: number;
    byCategory: Record<ExerciceCategory, number>;
  }> = {};

  history.forEach(entry => {
    const dateKey = getDateKey(entry.completedAt);

    if (dateKey && dateKeys.has(dateKey)) {
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
    }
  });

  const realDays = allDays.map(day => {
    const dateKey = getDateKey(day) ?? '';
    const dayData = exercisesByDay[dateKey];
    const count = dayData?.count || 0;
    const { dominant, secondary } = dayData
      ? getDominantCategories(dayData.byCategory)
      : { dominant: null, secondary: null };

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
      isToday: isSameDay(day, realToday),
      isEmpty: false,
    };
  });

  return realDays;
}

export function getCurrentWeekData(history: HistoryEntry[], referenceDate?: Date): HeatmapDay[] {
  const endDate = referenceDate || new Date();
  const realToday = new Date();
  const weekStart = startOfWeek(endDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(endDate, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekDateKeys = new Set(allDays.map(day => getDateKey(day) ?? ''));

  const exercisesByDay: Record<string, {
    count: number;
    byCategory: Record<ExerciceCategory, number>;
  }> = {};

  history.forEach(entry => {
    const dateKey = getDateKey(entry.completedAt);

    if (dateKey && weekDateKeys.has(dateKey)) {
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
    }
  });

  const realDays = allDays.map(day => {
    const dateKey = getDateKey(day) ?? '';
    const dayData = exercisesByDay[dateKey];
    const count = dayData?.count || 0;
    const { dominant, secondary } = dayData
      ? getDominantCategories(dayData.byCategory)
      : { dominant: null, secondary: null };

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
      isToday: isSameDay(day, realToday),
      isEmpty: false,
    };
  });

  return realDays;
}
