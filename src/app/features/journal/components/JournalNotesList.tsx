'use client';

import { useCallback, useMemo } from 'react';
import type { JournalNote } from '@/app/types';
import { JournalNoteCard } from './JournalNoteCard';
import { useJournalNotes } from '../hooks/useJournalNotes';
import { useExercices } from '@/app/features/exercices';

type Props = {
  limit?: number;
};

export function JournalNotesList({ limit }: Props) {
  const { notes, refetch } = useJournalNotes();
  const { exercices } = useExercices();

  // Set des IDs d'exercices complétés dans la période (jour ou semaine selon resetFrequency)
  const completedExerciceIds = useMemo(() => {
    const ids = new Set<number>();
    for (const ex of exercices) {
      if (ex.completed) ids.add(ex.id);
    }
    return ids;
  }, [exercices]);

  const handleNoteUpdated = useCallback((_updatedNote: JournalNote) => {
    refetch();
  }, [refetch]);

  const displayedNotes = limit ? notes.slice(0, limit) : notes;

  return (
    <div>
      {displayedNotes.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
          {displayedNotes.map(note => (
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
        <div className="text-center text-gray-500 py-8">
          Aucune entrée pour le moment
        </div>
      )}
    </div>
  );
}
