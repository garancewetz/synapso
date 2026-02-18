import { useCallback } from 'react';
import type { JournalNote } from '@/app/types';
import { shareJournalNoteAsText } from '@/app/utils/share';

export function useShareJournalNote(note: JournalNote) {
  const handleShare = useCallback(async () => {
    await shareJournalNoteAsText(note);
  }, [note]);

  return { handleShare };
}
