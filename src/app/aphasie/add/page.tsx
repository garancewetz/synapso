'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AphasieForm from '@/app/components/organisms/AphasieForm';
import { useUser } from '@/contexts/UserContext';

export default function AphasieAddPage() {
  const router = useRouter();
  const { currentUser } = useUser();

  // Rediriger si l'utilisateur n'est pas Calypso
  useEffect(() => {
    if (currentUser && currentUser.name !== 'Calypso') {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleSuccess = () => {
    router.push('/aphasie');
  };

  const handleCancel = () => {
    router.push('/aphasie');
  };

  // Ne rien afficher si l'utilisateur n'est pas Calypso
  if (!currentUser || currentUser.name !== 'Calypso') {
    return null;
  }

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

