'use client';

import { useRouter } from 'next/navigation';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import FormPageWrapper from '@/app/components/organisms/FormPageWrapper';

export default function AdminAddPage() {
  const router = useRouter();

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
      />
    </FormPageWrapper>
  );
}

