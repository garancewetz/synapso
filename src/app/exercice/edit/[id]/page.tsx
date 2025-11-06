'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import Sidebar from '@/app/components/organisms/Sidebar';
import HamburgerMenu from '@/app/components/atoms/HamburgerMenu';

interface AdminEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Données factices pour la sidebar (non utilisées dans les pages admin)
  const dummyEquipments = [{ name: 'Aucun', count: 0 }];

  // Extraire l'ID de l'exercice depuis les paramètres
  const { id } = use(params);
  const exerciceId = id ? parseInt(id) : null;

  if (!exerciceId || isNaN(exerciceId)) {
    router.push('/');
    return null;
  }

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
                    exerciceId={exerciceId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </div>
            </div>
        </div>
    
  );
}

