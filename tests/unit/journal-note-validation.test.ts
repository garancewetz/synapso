import { describe, it, expect } from 'vitest';
import { isNoteValidatedForDay } from '@/app/features/journal/hooks/useValidateJournalNote';
import type { JournalNote } from '@/app/types';

function noteWithValidatedAt(validatedAt: string | null): JournalNote {
  return {
    id: 1,
    title: 'Test',
    description: '',
    date: null,
    pinned: false,
    validated: !!validatedAt,
    validatedAt,
    media: null,
    exercices: [],
    userId: 1,
    createdAt: '',
    updatedAt: '',
  };
}

describe('isNoteValidatedForDay', () => {
  it('returns false when validatedAt is null', () => {
    const note = noteWithValidatedAt(null);
    expect(isNoteValidatedForDay(note, '2026-03-02')).toBe(false);
  });

  it('returns true when validatedAt is the same day as referenceDateKey', () => {
    const note = noteWithValidatedAt('2026-03-02T12:00:00.000Z');
    expect(isNoteValidatedForDay(note, '2026-03-02')).toBe(true);
  });

  it('returns false when validatedAt is a different day than referenceDateKey', () => {
    const note = noteWithValidatedAt('2026-03-02T12:00:00.000Z');
    expect(isNoteValidatedForDay(note, '2026-03-03')).toBe(false);
    expect(isNoteValidatedForDay(note, '2026-03-01')).toBe(false);
  });

  it('uses getDateKey so validatedAt at noon UTC matches the calendar day', () => {
    const note = noteWithValidatedAt('2026-03-02T12:00:00.000Z');
    expect(isNoteValidatedForDay(note, '2026-03-02')).toBe(true);
  });
});
