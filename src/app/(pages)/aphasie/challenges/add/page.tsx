'use client';

import { useRouter } from 'next/navigation';
import AphasieChallengeForm from '@/app/components/AphasieChallengeForm';
import FormPageWrapper from '@/app/components/FormPageWrapper';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';

export default function AphasieChallengeAddPage() {
  const router = useRouter();
  const { hasAccess } = useAphasieCheck();

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  // Ne rien afficher si l'utilisateur n'a pas accès à la page aphasie
  if (!hasAccess) {
    return null;
  }

  return (
    <FormPageWrapper title="Ajouter un exercice">
      <AphasieChallengeForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}

