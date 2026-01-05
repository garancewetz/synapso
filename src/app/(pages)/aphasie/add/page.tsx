'use client';

import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/AphasieForm';
import FormPageWrapper from '@/app/components/FormPageWrapper';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';

export default function AphasieAddPage() {
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
    <FormPageWrapper backHref="/aphasie">
      <AphasieForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </FormPageWrapper>
  );
}

