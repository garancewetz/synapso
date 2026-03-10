import { describe, it, expect } from 'vitest';
import { getBodypartsByCategory, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

describe('getBodypartsByCategory', () => {
  it('returns one key per category', () => {
    const result = getBodypartsByCategory();
    expect(Object.keys(result).sort()).toEqual([...CATEGORY_ORDER].sort());
  });

  it('returns arrays of strings for each category', () => {
    const result = getBodypartsByCategory();
    for (const category of CATEGORY_ORDER) {
      expect(Array.isArray(result[category as ExerciceCategory])).toBe(true);
      expect(result[category as ExerciceCategory].every((bp) => typeof bp === 'string')).toBe(true);
    }
  });

  it('keeps bodyparts order (display order)', () => {
    const result = getBodypartsByCategory();
    const upper = result.UPPER_BODY;
    const core = result.CORE;
    expect(upper).toContain('Bras');
    expect(upper).toContain('Cou');
    expect(upper.indexOf('Cou')).toBeLessThan(upper.indexOf('Bras'));
    expect(core).toContain('Dos');
    expect(core).toContain('Ventre');
  });
});
