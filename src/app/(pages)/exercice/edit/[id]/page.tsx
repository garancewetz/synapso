'use client';

import { Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExerciceForm from '@/app/components/ExerciceForm';
import FormPageWrapper from '@/app/components/FormPageWrapper';
import { Loader } from '@/app/components/ui';

interface EditPageContentProps {
  exerciceId: number;
}

function EditPageContent({ exerciceId }: EditPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  const navigateBack = () => {
    if (fromParam) {
      router.push(fromParam);
    } else {
      router.push('/');
    }
  };

  const handleSuccess = () => {
    navigateBack();
  };

  const handleCancel = () => {
    navigateBack();
  };

  return (
    <ExerciceForm
      exerciceId={exerciceId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

interface AdminEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const { id } = use(params);
  const exerciceId = id ? parseInt(id) : null;

  if (!exerciceId || isNaN(exerciceId)) {
    return null;
  }

  return (
    <FormPageWrapper>
      <Suspense fallback={<div className="flex justify-center py-12"><Loader size="large" /></div>}>
        <EditPageContent exerciceId={exerciceId} />
      </Suspense>
    </FormPageWrapper>
  );
}

