'use client';

import { useRouter } from 'next/navigation';
import { JournalNoteForm } from '@/app/features/journal';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';

export default function JournalNoteAddPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/journal');
  };

  const handleCancel = () => {
    router.push('/journal');
  };

  return (
    <FormPageWrapper title="Ajouter une entrée" backHref="/journal">
      <JournalNoteForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}
