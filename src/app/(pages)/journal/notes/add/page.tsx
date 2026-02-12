'use client';

import { useRouter } from 'next/navigation';
import { JournalNoteForm, useJournalCheck } from '@/app/features/journal';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';

export default function JournalNoteAddPage() {
  const router = useRouter();
  const { hasAccess } = useJournalCheck();

  const handleSuccess = () => {
    router.push('/journal');
  };

  const handleCancel = () => {
    router.push('/journal');
  };

  // Ne rien afficher si l'utilisateur n'a pas accès au journal
  if (!hasAccess) {
    return null;
  }

  return (
    <FormPageWrapper title="Ajouter une note" backHref="/journal">
      <JournalNoteForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}

