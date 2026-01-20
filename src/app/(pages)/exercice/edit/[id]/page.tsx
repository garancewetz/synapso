'use client';

import { Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ExerciceForm } from '@/app/components/ExerciceForm';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';
import { Loader } from '@/app/components/ui';

type EditPageContentProps = {
  exerciceId: number;
  onNavigateBack: () => void;
};

function EditPageContent({ exerciceId, onNavigateBack }: EditPageContentProps) {
  return (
    <ExerciceForm
      exerciceId={exerciceId}
      onSuccess={onNavigateBack}
      onCancel={onNavigateBack}
    />
  );
}

type EditPageWrapperProps = {
  exerciceId: number;
};

function EditPageWrapper({ exerciceId }: EditPageWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');
  
  const backHref = fromParam || '/';

  const navigateBack = () => {
    router.push(backHref);
  };

  return (
    <FormPageWrapper backHref={backHref} title="Modifier l'exercice">
      <EditPageContent exerciceId={exerciceId} onNavigateBack={navigateBack} />
    </FormPageWrapper>
  );
}

type AdminEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const { id } = use(params);
  const exerciceId = id ? parseInt(id) : null;

  if (!exerciceId || isNaN(exerciceId)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader size="large" /></div>}>
      <EditPageWrapper exerciceId={exerciceId} />
    </Suspense>
  );
}

