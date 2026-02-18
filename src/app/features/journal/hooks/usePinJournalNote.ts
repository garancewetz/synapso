import { useState, useCallback } from 'react';
import type { JournalNote } from '@/app/types';

type UsePinJournalNoteOptions = {
  note: JournalNote;
  userId: number;
  onCompleted?: (updatedNote: JournalNote) => void;
};

type UsePinJournalNoteReturn = {
  handlePin: (e?: React.MouseEvent) => Promise<void>;
  isPinning: boolean;
};

export function usePinJournalNote({
  note,
  userId,
  onCompleted,
}: UsePinJournalNoteOptions): UsePinJournalNoteReturn {
  const [isPinning, setIsPinning] = useState(false);

  const handlePin = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      if (!userId) return;

      setIsPinning(true);
      try {
        const response = await fetch(`/api/journal/notes/${note.id}/pin`, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const updatedNote: JournalNote = {
            ...note,
            pinned: data.pinned,
          };

          if (onCompleted) {
            onCompleted(updatedNote);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du pin:', error);
      } finally {
        setIsPinning(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note.id, note.pinned, userId, onCompleted]
  );

  return {
    handlePin,
    isPinning,
  };
}
