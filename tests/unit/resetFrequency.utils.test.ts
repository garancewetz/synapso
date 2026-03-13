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

  it('returns true when date is within same week (WEEKLY)', () => {
    // Mercredi 4 mars 2026 comme référence
    const ref = new Date('2026-03-04T12:00:00.000Z');
    // Lundi 2 mars (début de semaine)
    const monday = new Date('2026-03-02T12:00:00.000Z');
    expect(isDateInPeriodRange(monday, 'WEEKLY', ref)).toBe(true);
    // Mardi
    const tuesday = new Date('2026-03-03T12:00:00.000Z');
    expect(isDateInPeriodRange(tuesday, 'WEEKLY', ref)).toBe(true);
  });

  it('returns false when date is in previous week (WEEKLY)', () => {
    // Lundi 2 mars comme référence
    const ref = new Date('2026-03-02T12:00:00.000Z');
    // Dimanche 1 mars (semaine précédente)
    const sunday = new Date('2026-03-01T12:00:00.000Z');
    expect(isDateInPeriodRange(sunday, 'WEEKLY', ref)).toBe(false);
  });

  it('handles week boundary at midnight (dimanche → lundi) en timezone locale', () => {
    // Lundi 2 mars 2026 midi (local)
    const ref = new Date('2026-03-02T12:00:00');
    // Dimanche 1 mars 14h (local) — semaine précédente
    const sundayAfternoon = new Date('2026-03-01T14:00:00');
    expect(isDateInPeriodRange(sundayAfternoon, 'WEEKLY', ref)).toBe(false);
    // Lundi 2 mars 08h (local) — même semaine
    const mondayMorning = new Date('2026-03-02T08:00:00');
    expect(isDateInPeriodRange(mondayMorning, 'WEEKLY', ref)).toBe(true);
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
