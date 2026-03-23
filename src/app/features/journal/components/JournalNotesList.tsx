'use client';

import { useCallback, useMemo } from 'react';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { JournalNoteCard } from './JournalNoteCard';
import { useJournalNotes } from '../hooks/useJournalNotes';
import { useExercices } from '@/app/features/exercices';
import { isNoteValidatedForDay } from '../hooks/useValidateJournalNote';

type Props = {
  limit?: number;
};

export function JournalNotesList({ limit }: Props) {
  const { notes, refetch } = useJournalNotes();
  const { exercices } = useExercices();
  const { referenceDateKey } = useTimeContext();

  // Set des IDs d'exercices complétés : progression générale + exercices des entrées validées pour le jour de référence
  const completedExerciceIds = useMemo(() => {
    const ids = new Set<number>();
    for (const ex of exercices) {
      if (ex.completed) ids.add(ex.id);
    }
    for (const note of notes) {
      if (referenceDateKey && isNoteValidatedForDay(note, referenceDateKey) && note.exercices?.length) {
        for (const ex of note.exercices) {
          ids.add(ex.id);
        }
      }
    }
    return ids;
  }, [exercices, notes, referenceDateKey]);

  const handleNoteUpdated = useCallback(() => {
    refetch();
  }, [refetch]);

  const displayedNotes = limit ? notes.slice(0, limit) : notes;

  return (
    <>
      {displayedNotes.length > 0 ? (
        <ul className="flex flex-col list-none p-0 m-0 gap-6">
          {displayedNotes.map((note) => (
            <li key={note.id}>
              <JournalNoteCard
                note={note}
                completedExerciceIds={completedExerciceIds}
                onUpdated={handleNoteUpdated}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500 text-center py-12 text-sm">
          Aucune note pour le moment. Ajoutez-en une pour commencer.
        </p>
      )}
    </>
  );
}
