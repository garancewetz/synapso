'use client';

import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/organisms/AphasieForm';

export default function AphasieAddPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6">
          <AphasieForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

