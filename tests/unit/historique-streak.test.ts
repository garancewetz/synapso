import { describe, it, expect } from 'vitest';
import {
  calculateCurrentStreak,
  type HeatmapDay,
} from '@/app/features/historique/utils/historique.utils';

function day(count: number, isEmpty: boolean, date?: Date): HeatmapDay {
  return {
    date: date ?? null,
    dateKey: date ? date.toISOString().slice(0, 10) : '',
    count,
    dominantCategory: null,
    secondaryCategory: null,
    allCategories: [],
    isToday: false,
    isEmpty,
  };
}

describe('calculateCurrentStreak', () => {
  it('returns 0 for empty heatmap', () => {
    expect(calculateCurrentStreak([])).toBe(0);
  });

  it('returns 0 when last days are all empty', () => {
    const data: HeatmapDay[] = [
      day(0, true),
      day(0, true),
      day(0, true),
    ];
    expect(calculateCurrentStreak(data)).toBe(0);
  });

  it('counts consecutive non-empty days from the end', () => {
    const data: HeatmapDay[] = [
      day(0, true),
      day(2, false),
      day(1, false),
      day(3, false),
    ];
    expect(calculateCurrentStreak(data)).toBe(3);
  });

  it('stops when reaching a day with count 0 that is not today', () => {
    const refDate = new Date('2026-03-05T12:00:00.000Z');
    const data: HeatmapDay[] = [
      day(1, false, new Date('2026-03-02T12:00:00.000Z')),
      day(0, false, new Date('2026-03-03T12:00:00.000Z')),
      day(2, false, new Date('2026-03-04T12:00:00.000Z')),
      day(1, false, new Date('2026-03-05T12:00:00.000Z')),
    ];
    expect(calculateCurrentStreak(data, refDate)).toBe(2);
  });
});
