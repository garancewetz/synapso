'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/organisms/AphasieForm';
import FormPageWrapper from '@/app/components/organisms/FormPageWrapper';
import { useCalypsoCheck } from '@/hooks/useCalypsoCheck';

interface AphasieEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AphasieEditPage({ params }: AphasieEditPageProps) {
  const router = useRouter();
  const { isCalypso } = useCalypsoCheck();
  const { id } = use(params);
  const itemId = id ? parseInt(id) : null;

  if (!itemId || isNaN(itemId)) {
    router.push('/aphasie');
    return null;
  }

  // Ne rien afficher si l'utilisateur n'est pas Calypso
  if (!isCalypso) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  return (
    <FormPageWrapper>
      <AphasieForm
        itemId={itemId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </FormPageWrapper>
  );
}

