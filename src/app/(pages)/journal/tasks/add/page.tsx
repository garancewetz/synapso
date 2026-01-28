'use client';

import { useRouter } from 'next/navigation';
import { JournalTaskForm } from '@/app/components/JournalTaskForm';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';
import { useJournalCheck } from '@/app/hooks/useJournalCheck';

export default function JournalTaskAddPage() {
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
    <FormPageWrapper title="Ajouter une tâche" backHref="/journal">
      <JournalTaskForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}

