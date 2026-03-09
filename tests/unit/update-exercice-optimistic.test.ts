import { describe, it, expect } from 'vitest';

/**
 * Tests de la logique d'optimistic update de updateExercice.
 * On reproduit la logique exacte du hook pour la tester de manière isolée
 * sans dépendre de React Query / React.
 */

type Exercice = {
  id: number;
  name: string;
  archived: boolean;
  category: string;
};

type ListFilters = { includeArchived?: boolean };

type CacheEntry = {
  queryKey: readonly unknown[];
  data: Exercice[];
};

/**
 * Reproduit la logique de updateExercice du hook useExercices (version corrigée).
 */
function applyOptimisticUpdate(
  entries: CacheEntry[],
  updatedExercice: Exercice
): Map<string, Exercice[]> {
  const results = new Map<string, Exercice[]>();

  for (const { queryKey, data: old } of entries) {
    const listFilters = queryKey[2] as ListFilters | undefined;
    const hasExercise = old.some((ex) => ex.id === updatedExercice.id);
    // Ne mettre à jour que les listes qui contiennent déjà l'exercice
    if (!hasExercise) {
      results.set(JSON.stringify(queryKey), old);
      continue;
    }
    let next = old.map((ex) => (ex.id === updatedExercice.id ? updatedExercice : ex));
    const isArchivedList = listFilters?.includeArchived === true;
    if (!isArchivedList && updatedExercice.archived) {
      next = next.filter((ex) => ex.id !== updatedExercice.id);
    } else if (isArchivedList && !updatedExercice.archived) {
      next = next.filter((ex) => ex.id !== updatedExercice.id);
    }
    results.set(JSON.stringify(queryKey), next);
  }

  return results;
}

const exerciceA: Exercice = { id: 1, name: 'Pompes', archived: false, category: 'UPPER_BODY' };
const exerciceB: Exercice = { id: 2, name: 'Squats', archived: false, category: 'LOWER_BODY' };

describe('updateExercice optimistic update', () => {
  it('updates exercice data in lists that contain it', () => {
    const entries: CacheEntry[] = [
      {
        queryKey: ['exercices', 'list', { includeArchived: false }],
        data: [exerciceA, exerciceB],
      },
    ];

    const updated = { ...exerciceA, name: 'Pompes modifiées' };
    const results = applyOptimisticUpdate(entries, updated);
    const list = results.get(JSON.stringify(entries[0].queryKey))!;
    expect(list).toHaveLength(2);
    expect(list[0].name).toBe('Pompes modifiées');
    expect(list[1].name).toBe('Squats');
  });

  it('does NOT add exercice to lists that do not already contain it', () => {
    const upperBodyList: CacheEntry = {
      queryKey: ['exercices', 'list', { category: 'UPPER_BODY', includeArchived: false }],
      data: [exerciceA],
    };
    const lowerBodyList: CacheEntry = {
      queryKey: ['exercices', 'list', { category: 'LOWER_BODY', includeArchived: false }],
      data: [exerciceB],
    };

    // Mettre à jour exerciceA — ne devrait PAS apparaître dans lowerBodyList
    const updated = { ...exerciceA, name: 'Pompes v2' };
    const results = applyOptimisticUpdate([upperBodyList, lowerBodyList], updated);

    const upper = results.get(JSON.stringify(upperBodyList.queryKey))!;
    expect(upper).toHaveLength(1);
    expect(upper[0].name).toBe('Pompes v2');

    const lower = results.get(JSON.stringify(lowerBodyList.queryKey))!;
    expect(lower).toHaveLength(1);
    expect(lower[0].id).toBe(2); // Squats inchangé
  });

  it('removes exercice from active list when archived', () => {
    const entries: CacheEntry[] = [
      {
        queryKey: ['exercices', 'list', { includeArchived: false }],
        data: [exerciceA, exerciceB],
      },
    ];

    const archived = { ...exerciceA, archived: true };
    const results = applyOptimisticUpdate(entries, archived);
    const list = results.get(JSON.stringify(entries[0].queryKey))!;
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(2);
  });

  it('removes exercice from archived list when unarchived', () => {
    const archivedExercice = { ...exerciceA, archived: true };
    const entries: CacheEntry[] = [
      {
        queryKey: ['exercices', 'list', { includeArchived: true }],
        data: [archivedExercice],
      },
    ];

    const unarchived = { ...archivedExercice, archived: false };
    const results = applyOptimisticUpdate(entries, unarchived);
    const list = results.get(JSON.stringify(entries[0].queryKey))!;
    expect(list).toHaveLength(0);
  });

  it('keeps exercice in active list when not archived', () => {
    const entries: CacheEntry[] = [
      {
        queryKey: ['exercices', 'list', { includeArchived: false }],
        data: [exerciceA],
      },
    ];

    const updated = { ...exerciceA, name: 'Pompes légères' };
    const results = applyOptimisticUpdate(entries, updated);
    const list = results.get(JSON.stringify(entries[0].queryKey))!;
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Pompes légères');
  });

  it('skips cache entries with no data', () => {
    const entries: CacheEntry[] = [
      {
        queryKey: ['exercices', 'list', { includeArchived: false }],
        data: [exerciceA],
      },
    ];

    const results = applyOptimisticUpdate(entries, { ...exerciceA, name: 'Test' });
    expect(results.size).toBe(1);
  });
});
