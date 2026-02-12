'use client';

import { useRouter, useParams } from 'next/navigation';
import { JournalNoteForm, useJournalCheck } from '@/app/features/journal';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';

export default function JournalNoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const { hasAccess } = useJournalCheck();
  const noteId = parseInt(params.id as string);

  // Ne rien afficher si l'utilisateur n'a pas accès au journal
  if (!hasAccess) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/journal');
  };

  const handleCancel = () => {
    router.push('/journal');
  };

  return (
    <FormPageWrapper title="Modifier une note" backHref="/journal">
      <JournalNoteForm noteId={noteId} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}

