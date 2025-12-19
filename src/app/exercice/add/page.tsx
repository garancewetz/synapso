'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import FormPageWrapper from '@/app/components/organisms/FormPageWrapper';
import { ExerciceCategory } from '@/types/exercice';

export default function AdminAddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Convertir le paramètre de catégorie en ExerciceCategory
  const getCategoryFromParam = (param: string | null): ExerciceCategory | undefined => {
    if (!param) return undefined;
    // Convertir "upper_body" ou "upper-body" en "UPPER_BODY"
    const normalized = param.toUpperCase().replace(/-/g, '_');
    if (['UPPER_BODY', 'CORE', 'LOWER_BODY', 'STRETCHING'].includes(normalized)) {
      return normalized as ExerciceCategory;
    }
    return undefined;
  };

  const initialCategory = getCategoryFromParam(categoryParam);

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <FormPageWrapper>
      <ExerciceForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialCategory={initialCategory}
      />
    </FormPageWrapper>
  );
}

