'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import Sidebar from '@/app/components/organisms/Sidebar';
import HamburgerMenu from '@/app/components/atoms/HamburgerMenu';

interface AdminEditPageProps {
  params: {
    id: string;
  };
}

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const [exerciceId, setExerciceId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Données factices pour la sidebar (non utilisées dans les pages admin)
  const dummyEquipments = [{ name: 'Aucun', count: 0 }];

  // Extraire l'ID de l'exercice depuis les paramètres
  const id = params?.id ? parseInt(params.id) : null;

  useEffect(() => {
    // Vérifier que l'ID est valide
    if (id && !isNaN(id)) {
      setExerciceId(id);
    } else if (params?.id) {
      // Si params.id existe mais n'est pas un nombre valide, rediriger
      router.push('/');
    }
  }, [id, router, params?.id]);

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (!exerciceId) {
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

