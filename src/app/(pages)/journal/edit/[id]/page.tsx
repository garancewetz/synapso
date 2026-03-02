'use client';

import { useRouter, useParams } from 'next/navigation';
import { JournalNoteForm } from '@/app/features/journal';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';

export default function JournalNoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = parseInt(params.id as string);

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
