'use client';

import { JournalSectionHeader } from '@/app/components/JournalSectionHeader';
import { JournalTasksList } from '@/app/components/JournalTasksList';
import { BackButton } from '@/app/components/ui/BackButton';
import { AddButton } from '@/app/components/ui/AddButton';
import { useJournalCheck } from '@/app/hooks/useJournalCheck';

export default function JournalTasksPage() {
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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">📔 Toutes les tâches</h1>
            <JournalSectionHeader
              addHref="/journal/tasks/add"
              addLabel="Ajouter une tâche"
              hideAddButton
            />
          </div>
          <div className="mb-4 flex justify-center">
            <AddButton 
              href="/journal/tasks/add" 
              label="Ajouter une tâche" 
            />
          </div>
          <JournalTasksList />
        </div>
      </div>
    </div>
  );
}

