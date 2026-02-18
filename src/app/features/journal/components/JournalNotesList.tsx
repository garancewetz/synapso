'use client';

import { useCallback } from 'react';
import type { JournalNote } from '@/app/types';
import { JournalNoteCard } from './JournalNoteCard';
import { useJournalNotes } from '../hooks/useJournalNotes';

type Props = {
  limit?: number;
};

export function JournalNotesList({ limit }: Props) {
  const { notes, refetch } = useJournalNotes();

  const handleNoteUpdated = useCallback((_updatedNote: JournalNote) => {
    refetch();
  }, [refetch]);

  const displayedNotes = limit ? notes.slice(0, limit) : notes;

  return (
    <div>
      {displayedNotes.length > 0 ? (
        <ul className="space-y-4">
          {displayedNotes.map(note => (
            <JournalNoteCard
              key={note.id}
              note={note}
              onUpdated={handleNoteUpdated}
            />
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Aucune note pour le moment
        </div>
      )}
    </div>
  );
}
