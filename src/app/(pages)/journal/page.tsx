'use client';

import { JournalNotesList } from '@/app/features/journal';
import { BackButton } from '@/app/components/ui/BackButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { JOURNAL_EMOJI } from '@/app/constants/emoji.constants';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

export default function JournalPage() {
  const { preserveDate } = useLayoutContext();

  return (
    <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-2 md:pt-4 pb-4 md:pb-8 px-3 md:px-6 lg:px-8">
      <BackButton className="mb-4" buttonClassName="py-3" />

      <div className="sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{JOURNAL_EMOJI} Mon journal</h1>
          </div>
          <div className="mb-4 flex justify-center">
            <AddButton
              href={preserveDate('/journal/add')}
              label="Ajouter une entrée"
            />
          </div>
          <JournalNotesList />
        </div>
      </div>
    </div>
  );
}
