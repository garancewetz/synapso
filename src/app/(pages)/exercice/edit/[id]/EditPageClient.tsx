'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ExerciceForm } from '@/app/features/exercices';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';

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

type EditPageClientProps = {
  exerciceId: number;
};

export function EditPageClient({ exerciceId }: EditPageClientProps) {
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
