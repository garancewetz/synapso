'use client';

import { useRouter, useParams } from 'next/navigation';
import AphasieChallengeForm from '@/app/components/AphasieChallengeForm';
import FormPageWrapper from '@/app/components/FormPageWrapper';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';

export default function AphasieExerciceEditPage() {
  const router = useRouter();
  const params = useParams();
  const { hasAccess } = useAphasieCheck();
  const challengeId = parseInt(params.id as string);

  // Ne rien afficher si l'utilisateur n'a pas accès à la page aphasie
  if (!hasAccess) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  return (
    <FormPageWrapper title="Modifier un exercice" backHref="/aphasie">
      <AphasieChallengeForm challengeId={challengeId} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageWrapper>
  );
}

