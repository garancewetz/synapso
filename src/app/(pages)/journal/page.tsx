'use client';

import { JournalNotesList, useJournalCheck } from '@/app/features/journal';
import { BackButton } from '@/app/components/ui/BackButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { JOURNAL_EMOJI } from '@/app/constants/emoji.constants';

export default function JournalPage() {
  const { hasAccess } = useJournalCheck();

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-4 md:pb-8">
      <BackButton className="mb-4" buttonClassName="py-3" />

      <div className="px-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{JOURNAL_EMOJI} Mon journal</h1>
          </div>
          <div className="mb-4 flex justify-center">
            <AddButton
              href="/journal/add"
              label="Ajouter une note"
            />
          </div>
          <JournalNotesList />
        </div>
      </div>
    </div>
  );
}
