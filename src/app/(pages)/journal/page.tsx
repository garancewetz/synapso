'use client';

import { JournalSectionHeader } from '@/app/components/JournalSectionHeader';
import { JournalNotesList } from '@/app/components/JournalNotesList';
import { JournalTasksList } from '@/app/components/JournalTasksList';
import { BackButton } from '@/app/components/ui/BackButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { JOURNAL_EMOJI } from '@/app/constants/emoji.constants';
import { useJournalCheck } from '@/app/hooks/useJournalCheck';
import { Card } from '@/app/components/ui/Card';

export default function JournalPage() {
  const { hasAccess } = useJournalCheck();

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-4 md:pb-8">
      {/* Bouton retour accueil */}
      <BackButton className="mb-4" buttonClassName="py-3" />

      <div className="px-3 sm:p-6">
        <div className="space-y-6">
          {/* Section Tâches */}
          <Card variant="default" padding="md">
            <JournalSectionHeader
              title="Tâches"
              emoji="📔"
              addHref="/journal/tasks/add"
              addLabel="Ajouter une tâche"
              hideAddButton
            />
            <JournalTasksList limit={3} />
            <div className="mt-4 flex justify-center">
              <AddButton 
                href="/journal/tasks/add" 
                label="Ajouter une tâche" 
              />
            </div>
          </Card>

          {/* Section Notes */}
          <Card variant="default" padding="md">
            <JournalSectionHeader
              title="Notes"
              emoji={JOURNAL_EMOJI}
              addHref="/journal/notes/add"
              addLabel="Ajouter une note"
              hideAddButton
            />
            <JournalNotesList limit={3} />
            <div className="mt-4 flex justify-center">
              <AddButton 
                href="/journal/notes/add" 
                label="Ajouter une note" 
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

