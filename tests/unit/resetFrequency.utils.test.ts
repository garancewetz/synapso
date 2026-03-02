import { describe, it, expect } from 'vitest';
import {
  getStartOfPeriod,
  isDateInPeriodRange,
  isCompletedInPeriod,
  isCompletedToday,
  getCompletionDayLabel,
} from '@/app/utils/resetFrequency.utils';

describe('getStartOfPeriod', () => {
  it('returns startOfDay for DAILY', () => {
    const ref = new Date('2026-02-06T14:30:00.000Z');
    const result = getStartOfPeriod('DAILY', ref);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('returns start of week (Monday) for WEEKLY', () => {
    const ref = new Date('2026-02-06T12:00:00.000Z');
    const result = getStartOfPeriod('WEEKLY', ref);
    expect(result.getDay()).toBe(1);
  });
});

describe('isDateInPeriodRange', () => {
  it('returns false for null date', () => {
    expect(isDateInPeriodRange(null, 'DAILY', new Date())).toBe(false);
  });

  it('returns true when date is within same day (DAILY)', () => {
    const ref = new Date('2026-02-06T12:00:00.000Z');
    const completed = new Date('2026-02-06T08:00:00.000Z');
    expect(isDateInPeriodRange(completed, 'DAILY', ref)).toBe(true);
  });

  it('returns false when date is before period (DAILY)', () => {
    const ref = new Date('2026-02-06T12:00:00.000Z');
    const completed = new Date('2026-02-05T12:00:00.000Z');
    expect(isDateInPeriodRange(completed, 'DAILY', ref)).toBe(false);
  });
});

describe('isCompletedInPeriod', () => {
  it('returns false for null date', () => {
    expect(isCompletedInPeriod(null, 'DAILY', new Date())).toBe(false);
  });

  it('returns true when completed at or after period start', () => {
    const ref = new Date('2026-02-06T12:00:00.000Z');
    const completed = new Date('2026-02-06T10:00:00.000Z');
    expect(isCompletedInPeriod(completed, 'DAILY', ref)).toBe(true);
  });
});

describe('isCompletedToday', () => {
  it('returns false for null date', () => {
    expect(isCompletedToday(null, new Date())).toBe(false);
  });

  it('returns true when date is same day as reference', () => {
    const ref = new Date('2026-02-06T15:00:00');
    const date = new Date('2026-02-06T09:00:00');
    expect(isCompletedToday(date, ref)).toBe(true);
  });
});

describe('getCompletionDayLabel', () => {
  it('returns "Cette semaine" for null', () => {
    expect(getCompletionDayLabel(null)).toBe('Cette semaine');
  });

  it('returns "Aujourd\'hui" when same day as reference', () => {
    const ref = new Date('2026-02-06T12:00:00');
    const completed = new Date('2026-02-06T08:00:00');
    expect(getCompletionDayLabel(completed, ref)).toBe("Aujourd'hui");
  });

  it('returns "Ce lundi" etc for other days', () => {
    const ref = new Date('2026-02-06T12:00:00');
    const completed = new Date('2026-02-02T08:00:00');
    expect(getCompletionDayLabel(completed, ref)).toMatch(/^Ce [a-z]+$/);
  });
});
