'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ExerciceForm } from '@/app/components/ExerciceForm';
import { FormPageWrapper } from '@/app/components/FormPageWrapper';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';

function AddPageContent({ onNavigateBack, initialCategory }: { onNavigateBack: () => void; initialCategory?: ExerciceCategory }) {
  return (
    <ExerciceForm
      onSuccess={onNavigateBack}
      onCancel={onNavigateBack}
      initialCategory={initialCategory}
    />
  );
}

function AddPageContentWithParams({ onNavigateBack }: { onNavigateBack: () => void }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Convertir le paramètre de catégorie en ExerciceCategory
  const getCategoryFromParam = (param: string | null): ExerciceCategory | undefined => {
    if (!param) return undefined;
    // Convertir "upper_body" ou "upper-body" en "UPPER_BODY"
    const normalized = param.toUpperCase().replace(/-/g, '_');
    if (CATEGORY_ORDER.includes(normalized as ExerciceCategory)) {
      return normalized as ExerciceCategory;
    }
    return undefined;
  };

  const initialCategory = getCategoryFromParam(categoryParam);

  return <AddPageContent onNavigateBack={onNavigateBack} initialCategory={initialCategory} />;
}

function AddPageWrapperWithParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');
  
  const backHref = fromParam || '/';

  const navigateBack = () => {
    router.push(backHref);
  };

  return (
    <FormPageWrapper backHref={backHref} title="Ajouter un exercice">
      <AddPageContentWithParams onNavigateBack={navigateBack} />
    </FormPageWrapper>
  );
}

export function AddPageClient() {
  return <AddPageWrapperWithParams />;
}
