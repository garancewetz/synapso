'use client';

import { useRouter } from 'next/navigation';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';

export default function AdminAddPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6">
          <ExerciceForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

