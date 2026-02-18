import { useState, useCallback } from 'react';
import type { JournalNote } from '@/app/types';

type UseValidateJournalNoteOptions = {
  note: JournalNote;
  userId: number;
  onCompleted?: (updatedNote: JournalNote) => void;
};

type UseValidateJournalNoteReturn = {
  handleValidate: (e?: React.MouseEvent) => Promise<void>;
  isValidating: boolean;
};

export function useValidateJournalNote({
  note,
  userId,
  onCompleted,
}: UseValidateJournalNoteOptions): UseValidateJournalNoteReturn {
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      if (!userId) return;

      setIsValidating(true);
      try {
        const response = await fetch(`/api/journal/notes/${note.id}/validate`, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const updatedNote: JournalNote = {
            ...note,
            validated: data.validated,
            validatedAt: data.validatedAt,
          };

          if (onCompleted) {
            onCompleted(updatedNote);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la validation:', error);
      } finally {
        setIsValidating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note.id, note.validated, userId, onCompleted]
  );

  return {
    handleValidate,
    isValidating,
  };
}
