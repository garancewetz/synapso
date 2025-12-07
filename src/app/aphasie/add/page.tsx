'use client';

import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/organisms/AphasieForm';
import FormPageWrapper from '@/app/components/organisms/FormPageWrapper';
import { useCalypsoCheck } from '@/hooks/useCalypsoCheck';

export default function AphasieAddPage() {
  const router = useRouter();
  const { isCalypso } = useCalypsoCheck();

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  // Ne rien afficher si l'utilisateur n'est pas Calypso
  if (!isCalypso) {
    return null;
  }

  return (
    <FormPageWrapper>
      <AphasieForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </FormPageWrapper>
  );
}

