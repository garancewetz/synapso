import type { HistoryEntry } from '@/app/types';
import { getDateKeyUTC } from '@/app/utils/date.utils';
import type { DayExercise } from './historique.types';

export function getExercisesForDay(
  history: HistoryEntry[],
  dateKey: string | null
): DayExercise[] {
  if (!dateKey || !history.length) return [];

  const filtered = history
    .filter(entry => {
      const entryDateKeyUTC = getDateKeyUTC(entry.completedAt);
      return entryDateKeyUTC === dateKey;
    })
    .map(entry => ({
      id: entry.exercice.id,
      name: entry.exercice.name,
      category: entry.exercice.category!,
      completedAt: entry.completedAt,
    }));

  const byExerciceId = new Map<number, (typeof filtered)[0]>();
  for (const ex of filtered) {
    const existing = byExerciceId.get(ex.id);
    if (!existing || new Date(ex.completedAt) > new Date(existing.completedAt)) {
      byExerciceId.set(ex.id, ex);
    }
  }
  return Array.from(byExerciceId.values()).sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export function getValidatedTodayExerciseIds(
  history: HistoryEntry[],
  dateKey: string | null
): Set<number> {
  if (!dateKey || !history.length) return new Set();

  const ids = new Set<number>();
  history.forEach(entry => {
    const entryDateKeyUTC = getDateKeyUTC(entry.completedAt);
    if (entryDateKeyUTC === dateKey) {
      ids.add(entry.exercice.id);
    }
  });
  return ids;
}
