'use client';

import { JournalNoteCard } from '@/app/components/JournalNoteCard';
import { useJournalNotes } from '@/app/hooks/useJournalNotes';
import { ViewAllLink } from '@/app/components/ui/ViewAllLink';

type Props = {
  limit?: number;
};

export function JournalNotesList({ limit }: Props) {
  const { notes } = useJournalNotes();

  const displayedNotes = limit ? notes.slice(0, limit) : notes;
  const hasMoreTotal = limit && notes.length > limit;

  return (
    <div>
      {displayedNotes.length > 0 ? (
        <>
          <ul className="space-y-4">
            {displayedNotes.map(note => (
              <JournalNoteCard
                key={note.id}
                note={note}
              />
            ))}
          </ul>
          {limit && hasMoreTotal && (
            <div className="mt-4">
              <ViewAllLink 
                href="/journal/notes"
                label="Voir toutes les notes"
                emoji="📔"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Aucune note pour le moment
        </div>
      )}
    </div>
  );
}

