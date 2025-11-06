'use client';

import { useRouter } from 'next/navigation';
import TacheForm from '@/app/components/organisms/TacheForm';

export default function TachesEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const tacheId = parseInt(params.id);

  const handleSuccess = () => {
    router.push('/taches');
  };

  const handleCancel = () => {
    router.push('/taches');
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier une tâche</h1>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <TacheForm tacheId={tacheId} onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}

