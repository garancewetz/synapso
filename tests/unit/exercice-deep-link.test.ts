import { describe, it, expect } from 'vitest';
import { CATEGORY_HREFS } from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

/**
 * Convention partagée entre JournalNoteCard (liens exercices liés)
 * et la page catégorie (scroll vers #exercice-{id}).
 */
const EXERCICE_HASH_PREFIX = 'exercice-';

function buildExerciceDeepLinkHref(category: ExerciceCategory, exerciceId: number): string {
  const base = CATEGORY_HREFS[category];
  return `${base}#${EXERCICE_HASH_PREFIX}${exerciceId}`;
}

function parseExerciceIdFromHash(hash: string): string | null {
  if (!hash.startsWith(`#${EXERCICE_HASH_PREFIX}`)) return null;
  const id = hash.slice(`#${EXERCICE_HASH_PREFIX}`.length);
  return /^\d+$/.test(id) ? id : null;
}

describe('Exercice deep link (lien note → page catégorie)', () => {
  it('builds href with category path and #exercice-{id} for each category', () => {
    const categories = Object.keys(CATEGORY_HREFS) as ExerciceCategory[];
    const sampleId = 42;
    for (const category of categories) {
      const href = buildExerciceDeepLinkHref(category, sampleId);
      expect(href).toMatch(new RegExp(`^/exercices/[^#]+#${EXERCICE_HASH_PREFIX}${sampleId}$`));
      expect(href).toContain(CATEGORY_HREFS[category]);
    }
  });

  it('parseExerciceIdFromHash extracts id from hash', () => {
    expect(parseExerciceIdFromHash('#exercice-123')).toBe('123');
    expect(parseExerciceIdFromHash('#exercice-1')).toBe('1');
    expect(parseExerciceIdFromHash('#exercice-')).toBe(null);
    expect(parseExerciceIdFromHash('#other-123')).toBe(null);
    expect(parseExerciceIdFromHash('')).toBe(null);
  });

  it('selector id on category page matches built href', () => {
    const exerciceId = 99;
    const category = 'UPPER_BODY' as ExerciceCategory;
    const href = buildExerciceDeepLinkHref(category, exerciceId);
    const hash = href.split('#')[1];
    const expectedDomId = hash;
    expect(expectedDomId).toBe(`${EXERCICE_HASH_PREFIX}${exerciceId}`);
  });
});
