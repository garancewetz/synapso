'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/AphasieForm';
import FormPageWrapper from '@/app/components/FormPageWrapper';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';

interface AphasieEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AphasieEditPage({ params }: AphasieEditPageProps) {
  const router = useRouter();
  const { hasAccess } = useAphasieCheck();
  const { id } = use(params);
  const itemId = id ? parseInt(id) : null;

  if (!itemId || isNaN(itemId)) {
    router.push('/aphasie');
    return null;
  }

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
    <FormPageWrapper>
      <AphasieForm
        itemId={itemId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </FormPageWrapper>
  );
}

