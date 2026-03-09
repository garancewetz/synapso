'use client';

import { useRouter } from 'next/navigation';
import { JournalNoteForm } from '@/app/features/journal';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';
import { usePreserveDateParam } from '@/app/features/time-machine/hooks/usePreserveDateParam';

export default function JournalNoteAddPage() {
  const router = useRouter();
  const preserveDate = usePreserveDateParam();

  const handleSuccess = () => {
    router.push(preserveDate('/journal'));
  };

  const handleCancel = () => {
    router.push(preserveDate('/journal'));
  };

  return (
    <FormPageWrapper title="Ajouter une entrée" backHref={preserveDate('/journal')}>
      <JournalNoteForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}
