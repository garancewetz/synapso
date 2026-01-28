'use client';

import { useRouter, useParams } from 'next/navigation';
import { JournalTaskForm } from '@/app/components/JournalTaskForm';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';
import { useJournalCheck } from '@/app/hooks/useJournalCheck';

export default function JournalTaskEditPage() {
  const router = useRouter();
  const params = useParams();
  const { hasAccess } = useJournalCheck();
  const taskId = parseInt(params.id as string);

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
    <FormPageWrapper title="Modifier une tâche" backHref="/journal">
      <JournalTaskForm taskId={taskId} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}

