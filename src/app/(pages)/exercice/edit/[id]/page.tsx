'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceForm from '@/app/components/ExerciceForm';
import FormPageWrapper from '@/app/components/FormPageWrapper';

interface AdminEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const router = useRouter();

  // Extraire l'ID de l'exercice depuis les paramètres
  const { id } = use(params);
  const exerciceId = id ? parseInt(id) : null;

  if (!exerciceId || isNaN(exerciceId)) {
    router.push('/');
    return null;
  }

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <FormPageWrapper>
      <ExerciceForm
        exerciceId={exerciceId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </FormPageWrapper>
  );
}

