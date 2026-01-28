'use client';

import { JournalSectionHeader } from '@/app/components/JournalSectionHeader';
import { JournalNotesList } from '@/app/components/JournalNotesList';
import { BackButton } from '@/app/components/ui/BackButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { JOURNAL_EMOJI } from '@/app/constants/emoji.constants';
import { useJournalCheck } from '@/app/hooks/useJournalCheck';

export default function JournalNotesPage() {
  const { hasAccess } = useJournalCheck();

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour page journal */}
      <BackButton 
        backHref="/journal" 
        className="mb-4" 
        buttonClassName="py-3"
      />

      <div className="px-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{JOURNAL_EMOJI} Toutes les notes</h1>
            <JournalSectionHeader
              addHref="/journal/notes/add"
              addLabel="Ajouter une note"
              hideAddButton
            />
          </div>
          <div className="mb-4 flex justify-center">
            <AddButton 
              href="/journal/notes/add" 
              label="Ajouter une note" 
            />
          </div>
          <JournalNotesList />
        </div>
      </div>
    </div>
  );
}

