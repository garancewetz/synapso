import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDateKey,
  getDateKeyUTC,
  getDateFromKey,
  getWeekKey,
  formatWeekRange,
  getFriendlyWeekLabel,
} from '@/app/utils/date.utils';

describe('getDateKey', () => {
  it('returns null for null input', () => {
    expect(getDateKey(null)).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(getDateKey('not-a-date')).toBeNull();
  });

  it('returns yyyy-MM-dd for a Date at noon UTC', () => {
    const date = new Date('2026-02-06T12:00:00.000Z');
    expect(getDateKey(date)).toBe('2026-02-06');
  });

  it('returns yyyy-MM-dd for a dateKey string', () => {
    expect(getDateKey('2026-02-06')).toBe('2026-02-06');
  });

  it('returns the same dateKey for different times on the same local day', () => {
    // Midi UTC est sans ambiguïté (même jour calendaire de UTC-12 à UTC+12)
    const noon = new Date('2026-02-06T12:00:00.000Z');
    const morning = new Date('2026-02-06T08:00:00.000Z');
    expect(getDateKey(noon)).toBe(getDateKey(morning));
  });
});

describe('getDateFromKey', () => {
  it('returns null for null input', () => {
    expect(getDateFromKey(null)).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(getDateFromKey('')).toBeNull();
    expect(getDateFromKey('06-02-2026')).toBeNull();
    expect(getDateFromKey('2026/02/06')).toBeNull();
  });

  it('returns a Date for valid dateKey', () => {
    const result = getDateFromKey('2026-02-06');
    expect(result).toBeInstanceOf(Date);
    expect(result).not.toBeNull();
  });

  it('roundtrips with getDateKey', () => {
    const dateKey = '2026-02-06';
    const date = getDateFromKey(dateKey);
    expect(date).not.toBeNull();
    expect(getDateKey(date!)).toBe(dateKey);
  });

  it('accepts only yyyy-MM-dd format', () => {
    expect(getDateFromKey('2026-2-6')).toBeNull();
    expect(getDateFromKey('2026-02-06')).not.toBeNull();
  });
});

describe('getDateKeyUTC', () => {
  it('returns null for null input', () => {
    expect(getDateKeyUTC(null)).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(getDateKeyUTC('not-a-date')).toBeNull();
  });

  it('returns yyyy-MM-dd in UTC for an ISO string', () => {
    expect(getDateKeyUTC('2026-02-06T09:00:00.000Z')).toBe('2026-02-06');
    expect(getDateKeyUTC('2026-02-05T23:30:00.000Z')).toBe('2026-02-05');
  });

  it('returns same dateKey for same UTC day regardless of hour', () => {
    const midnight = new Date('2026-02-06T00:00:00.000Z');
    const noon = new Date('2026-02-06T12:00:00.000Z');
    const endOfDay = new Date('2026-02-06T23:59:59.999Z');
    expect(getDateKeyUTC(midnight)).toBe('2026-02-06');
    expect(getDateKeyUTC(noon)).toBe('2026-02-06');
    expect(getDateKeyUTC(endOfDay)).toBe('2026-02-06');
  });

  it('returns previous UTC day for late evening in positive timezone', () => {
    const cetEvening = new Date('2026-02-06T22:00:00.000Z');
    expect(getDateKeyUTC(cetEvening)).toBe('2026-02-06');
  });
});

describe('getWeekKey', () => {
  it('returns null for null input', () => {
    expect(getWeekKey(null)).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(getWeekKey('not-a-date')).toBeNull();
  });

  it('returns Monday yyyy-MM-dd for any day in the week (week starts Monday)', () => {
    expect(getWeekKey('2026-03-02')).toBe('2026-03-02');
    expect(getWeekKey('2026-03-04')).toBe('2026-03-02');
    expect(getWeekKey('2026-03-08')).toBe('2026-03-02');
  });

  it('returns same week key for dates in the same week', () => {
    const monday = new Date('2026-02-02T12:00:00.000Z');
    const sunday = new Date('2026-02-08T12:00:00.000Z');
    expect(getWeekKey(monday)).toBe(getWeekKey(sunday));
    expect(getWeekKey(monday)).toBe('2026-02-02');
  });
});

describe('formatWeekRange', () => {
  it('returns empty string for null or invalid input', () => {
    expect(formatWeekRange(null)).toBe('');
    expect(formatWeekRange('')).toBe('');
    expect(formatWeekRange('06-02-2026')).toBe('');
  });

  it('returns French date range for valid weekKey', () => {
    const result = formatWeekRange('2026-02-02');
    expect(result).toMatch(/^Du .+ au .+ \d{4}$/);
    expect(result).toContain('au');
  });
});

describe('getFriendlyWeekLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-04T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty primary for null or invalid input', () => {
    expect(getFriendlyWeekLabel(null).primary).toBe('');
    expect(getFriendlyWeekLabel('').primary).toBe('');
  });

  it('returns "Cette semaine" and secondary date range for current week', () => {
    const thisWeekMonday = '2026-03-02';
    const result = getFriendlyWeekLabel(thisWeekMonday);
    expect(result.primary).toBe('Cette semaine');
    expect(result.secondary).toBeDefined();
    expect(result.secondary).toMatch(/^Du .+ au .+$/);
  });

  it('returns "La semaine dernière" and secondary for previous week', () => {
    const lastWeekMonday = '2026-02-23';
    const result = getFriendlyWeekLabel(lastWeekMonday);
    expect(result.primary).toBe('La semaine dernière');
    expect(result.secondary).toBeDefined();
  });

  it('returns only primary date range for older weeks (no secondary)', () => {
    const olderWeek = '2026-02-16';
    const result = getFriendlyWeekLabel(olderWeek);
    expect(result.primary).toMatch(/^Du .+ au .+$/);
    expect(result.secondary).toBeUndefined();
  });
});
