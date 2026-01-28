'use client';

import { useRouter } from 'next/navigation';
import { JournalNoteForm } from '@/app/components/JournalNoteForm';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';
import { useJournalCheck } from '@/app/hooks/useJournalCheck';

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

