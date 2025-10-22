'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import Sidebar from '@/app/components/organisms/Sidebar';
import HamburgerMenu from '@/app/components/atoms/HamburgerMenu';

export default function AdminAddPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Données factices pour la sidebar (non utilisées dans les pages admin)
  const dummyEquipments = [{ name: 'Aucun', count: 0 }];

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.push('/');
  };

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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ajouter un exercice</h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">Créez un nouvel exercice pour votre programme d'entraînement</p>
            </div>
          </div>
          <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6">
                  <ExerciceForm
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
