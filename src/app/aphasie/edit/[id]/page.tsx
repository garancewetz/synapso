'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/organisms/AphasieForm';
import { useUser } from '@/contexts/UserContext';

interface AphasieEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AphasieEditPage({ params }: AphasieEditPageProps) {
  const router = useRouter();
  const { currentUser } = useUser();
  const { id } = use(params);
  const itemId = id ? parseInt(id) : null;

  // Rediriger si l'utilisateur n'est pas Calypso
  useEffect(() => {
    if (currentUser && currentUser.name !== 'Calypso') {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!itemId || isNaN(itemId)) {
    router.push('/aphasie');
    return null;
  }

  // Ne rien afficher si l'utilisateur n'est pas Calypso
  if (!currentUser || currentUser.name !== 'Calypso') {
    return null;
  }

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
            itemId={itemId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

