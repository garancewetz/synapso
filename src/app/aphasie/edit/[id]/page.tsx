'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/organisms/AphasieForm';

interface AphasieEditPageProps {
  params: {
    id: string;
  };
}

export default function AphasieEditPage({ params }: AphasieEditPageProps) {
  const [itemId, setItemId] = useState<number | null>(null);
  const router = useRouter();

  const id = params?.id ? parseInt(params.id) : null;

  useEffect(() => {
    if (id && !isNaN(id)) {
      setItemId(id);
    } else if (params?.id) {
      router.push('/aphasie');
    }
  }, [id, router, params?.id]);

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  if (!itemId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6">
          <AphasieForm
            itemId={itemId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

