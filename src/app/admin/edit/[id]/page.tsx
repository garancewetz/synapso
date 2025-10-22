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
    <div className="mx-auto min-h-screen">
      <div className="flex">
        <Sidebar 
          equipments={dummyEquipments}
          selectedEquipment={null}
          onEquipmentSelect={() => {}}
          statusFilter="all"
          onStatusFilterChange={() => {}}
          totalExercices={0}
          completedCount={0}
          pendingCount={0}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 h-screen flex flex-col lg:ml-0">
          <div className="border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-2">
              <div className="flex items-center gap-3">
                <HamburgerMenu 
                  isOpen={isSidebarOpen} 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Modifier l'exercice</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Modifiez les informations de cet exercice</p>
            </div>
          </div>
          <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6">
                  <ExerciceForm
                    exerciceId={exerciceId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
