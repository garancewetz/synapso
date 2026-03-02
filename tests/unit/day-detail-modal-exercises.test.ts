import { describe, it, expect } from 'vitest';
import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import {
  getExercisesForDay,
  getValidatedTodayExerciseIds,
} from '@/app/features/historique/utils/historique.utils';

const TODAY_KEY = '2026-03-02';

function createHistoryEntry(
  id: number,
  exerciceId: number,
  name: string,
  category: ExerciceCategory,
  completedAt: string
): HistoryEntry {
  return {
    id,
    completedAt,
    exercice: {
      id: exerciceId,
      name,
      category,
      bodyparts: [],
      equipments: [],
    },
  };
}

describe('Modale détail du jour – cohérence avec exercices validés aujourd’hui', () => {
  it('les exercices affichés dans la modale daily sont les mêmes que les exercices validés pour la date', () => {
    const history: HistoryEntry[] = [
      createHistoryEntry(
        1,
        10,
        'Squat',
        'LOWER_BODY',
        `${TODAY_KEY}T09:00:00.000Z`
      ),
      createHistoryEntry(
        2,
        11,
        'Push-up',
        'UPPER_BODY',
        `${TODAY_KEY}T10:30:00.000Z`
      ),
      createHistoryEntry(
        3,
        10,
        'Squat',
        'LOWER_BODY',
        `${TODAY_KEY}T14:00:00.000Z`
      ),
    ];

    const modalExercises = getExercisesForDay(history, TODAY_KEY);
    const validatedIds = getValidatedTodayExerciseIds(history, TODAY_KEY);

    const modalNames = new Set(modalExercises.map((e) => e.name));
    const idToName = new Map(
      history.map((e) => [e.exercice.id, e.exercice.name])
    );
    const validatedNames = new Set(
      [...validatedIds].map((id) => idToName.get(id)!)
    );

    expect(modalNames.size).toBe(validatedNames.size);
    expect(modalNames.size).toBe(2);
    for (const name of modalNames) {
      expect(validatedNames.has(name)).toBe(true);
    }
    for (const name of validatedNames) {
      expect(modalNames.has(name)).toBe(true);
    }
  });

  it('retourne le même ensemble de noms pour une date sans doublon', () => {
    const history: HistoryEntry[] = [
      createHistoryEntry(
        1,
        10,
        'Gainage',
        'CORE',
        `${TODAY_KEY}T08:00:00.000Z`
      ),
      createHistoryEntry(
        2,
        11,
        'Étirements',
        'STRETCHING',
        `${TODAY_KEY}T09:00:00.000Z`
      ),
    ];

    const modalExercises = getExercisesForDay(history, TODAY_KEY);
    const validatedIds = getValidatedTodayExerciseIds(history, TODAY_KEY);

    const modalNames = [...new Set(modalExercises.map((e) => e.name))].sort();
    const idToName = new Map(
      history.map((e) => [e.exercice.id, e.exercice.name])
    );
    const validatedNames = [...validatedIds]
      .map((id) => idToName.get(id)!)
      .sort();

    expect(modalNames).toEqual(validatedNames);
  });

  it('retourne des listes vides pour une date sans historique', () => {
    const history: HistoryEntry[] = [
      createHistoryEntry(
        1,
        10,
        'Squat',
        'LOWER_BODY',
        '2026-03-01T09:00:00.000Z'
      ),
    ];

    const modalExercises = getExercisesForDay(history, TODAY_KEY);
    const validatedIds = getValidatedTodayExerciseIds(history, TODAY_KEY);

    expect(modalExercises).toHaveLength(0);
    expect(validatedIds.size).toBe(0);
  });

  it('retourne des listes vides pour un dateKey null', () => {
    const history: HistoryEntry[] = [
      createHistoryEntry(
        1,
        10,
        'Squat',
        'LOWER_BODY',
        `${TODAY_KEY}T09:00:00.000Z`
      ),
    ];

    expect(getExercisesForDay(history, null)).toHaveLength(0);
    expect(getValidatedTodayExerciseIds(history, null).size).toBe(0);
  });
});
