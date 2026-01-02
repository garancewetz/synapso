'use client';

import { Suspense, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import ExerciceForm from '@/app/components/ExerciceForm';
import BackToHomeButton from '@/app/components/BackToHomeButton';
import { usePageFocus } from '@/app/hooks/usePageFocus';
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

  // Placer le focus sur le premier élément focusable de la page (excluant le menu fermé)
  usePageFocus({
    selector: 'input:not([disabled]):not([type="hidden"]), textarea:not([disabled])',
    excludeMenu: true,
  });

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      <BackToHomeButton />
      <div className="px-3 sm:p-6 bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Modifier l&apos;exercice</h1>
            <EditPageContent exerciceId={exerciceId} onNavigateBack={navigateBack} />
          </div>
        </div>
      </div>
    </div>
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

