'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import Sidebar from '@/app/components/organisms/Sidebar';
import BodyPartsNav from '@/app/components/molecules/BodyPartsNav';
import Button from '@/app/components/atoms/Button';
import PasswordModal from '@/app/components/atoms/PasswordModal';
import HamburgerMenu from '@/app/components/atoms/HamburgerMenu';
import FiltersExercices from '@/app/components/organisms/FiltersExercices';



export default function Home() {
  const [exercices, setExercices] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'add' | 'edit' | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const fetchExercices = () => {
    fetch('/api/exercices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExercices(data);
        } else {
          console.error('API error:', data);
          setExercices([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setExercices([]);
      });
  };


  useEffect(() => {
    fetchExercices();
  }, []);



  const allBodyparts = () => {
    const objectBodyparts: { [key: string]: { name: string; count: number; color: string; id: number } } = exercices.flatMap((exercice: any) => exercice.bodyparts || []).reduce((acc: any, bodypart: any) => {
      const key = bodypart.name;
      if (!acc[key]) {
        acc[key] = {
          name: bodypart.name,
          count: 0,
          color: bodypart.color,
          id: bodypart.id
        };
      }
      return acc;
    }, {} as { [key: string]: { name: string; count: number; color: string; id: number } });

    // Compter les exercices pour chaque bodypart en tenant compte des filtres
    let filteredExercices = exercices;

    // Filtre par équipement
    if (selectedEquipment) {
      filteredExercices = filteredExercices.filter((exercice: any) =>
        exercice.equipments && exercice.equipments.includes(selectedEquipment)
      );
    }

    // Filtre par statut
    if (statusFilter === 'completed') {
      filteredExercices = filteredExercices.filter((exercice: any) => exercice.completed);
    } else if (statusFilter === 'pending') {
      filteredExercices = filteredExercices.filter((exercice: any) => !exercice.completed);
    }

    filteredExercices.forEach((exercice: any) => {
      exercice.bodyparts?.forEach((bp: any) => {
        if (objectBodyparts[bp.name]) {
          objectBodyparts[bp.name].count++;
        }
      });
    });

    return Object.values(objectBodyparts)
      .filter((bodypart: any) => bodypart.count > 0)
      .sort((a: any, b: any) => b.count - a.count);
  }


  const exercicesByBodyPart = () => {
    const bodyparts = allBodyparts();
    let filteredExercices = exercices;

    // Filtre par équipement
    if (selectedEquipment) {
      filteredExercices = filteredExercices.filter((exercice: any) =>
        exercice.equipments && exercice.equipments.includes(selectedEquipment)
      );
    }

    // Filtre par statut
    if (statusFilter === 'completed') {
      filteredExercices = filteredExercices.filter((exercice: any) => exercice.completed);
    } else if (statusFilter === 'pending') {
      filteredExercices = filteredExercices.filter((exercice: any) => !exercice.completed);
    }

    return bodyparts.map((bodypart: any) => ({
      ...bodypart,
      exercices: filteredExercices.filter((exercice: any) =>
        exercice.bodyparts?.some((bp: any) => bp.id === bodypart.id)
      )
    }));
  }

  const getEquipments = () => {
    const equipmentCounts: { [key: string]: number } = {};

    exercices.forEach((exercice: any) => {
      if (exercice.equipments && Array.isArray(exercice.equipments)) {
        exercice.equipments.forEach((equipment: string) => {
          if (!equipmentCounts[equipment]) {
            equipmentCounts[equipment] = 0;
          }
          equipmentCounts[equipment]++;
        });
      }
    });

    return Object.entries(equipmentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  const getCounts = () => {
    const totalExercices = exercices.length;
    const completedCount = exercices.filter((exercice: any) => exercice.completed).length;
    const pendingCount = totalExercices - completedCount;

    return { totalExercices, completedCount, pendingCount };
  }

  const handleEditClick = (id: number) => {
    setPendingAction('edit');
    setPendingId(id);
    setShowPasswordModal(true);
  };

  const handleAddClick = () => {
    setPendingAction('add');
    setPendingId(null);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    if (pendingAction === 'add') {
      router.push('/exercice/add');
    } else if (pendingAction === 'edit' && pendingId) {
      router.push(`/exercice/edit/${pendingId}`);
    }
    setShowPasswordModal(false);
    setPendingAction(null);
    setPendingId(null);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingAction(null);
    setPendingId(null);
  };

  const handleCompleted = () => {
    fetchExercices();
  };


  return (
    <section>

      <div className="flex flex-col lg:ml-0">

        <BodyPartsNav bodyparts={allBodyparts()} />

        <div className='flex '>
          <div className='w-60 p-4'>
            <div className='sticky top-20'>

            <FiltersExercices
              equipments={getEquipments()}
              selectedEquipment={selectedEquipment}
              onEquipmentSelect={setSelectedEquipment}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              totalExercices={getCounts().totalExercices}
              completedCount={getCounts().completedCount}
              pendingCount={getCounts().pendingCount}
            />
            </div>
          </div>
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto flex-1 scroll-smooth bg-gray-50">
            {(() => {
              const filteredBodyParts = exercicesByBodyPart().filter((bodypart: any) => bodypart.exercices.length > 0);

              if (filteredBodyParts.length === 0) {
                // Construire le message des filtres actifs
                const activeFilters = [];

                if (statusFilter !== 'all') {
                  const statusLabels = {
                    'completed': 'Complétés',
                    'pending': 'À compléter'
                  };
                  activeFilters.push(statusLabels[statusFilter]);
                }

                if (selectedEquipment) {
                  activeFilters.push(selectedEquipment);
                }

                const filterText = activeFilters.length > 0
                  ? `avec les filtres "${activeFilters.join('" et "')}"`
                  : '';

                return (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun exercice trouvé
                      </h3>
                      <p className="text-gray-600">
                        Aucun résultat n'est disponible {filterText}.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Essayez de modifier vos filtres ou de réinitialiser la recherche.
                      </p>
                    </div>
                  </div>
                );
              }

              return filteredBodyParts.map((bodypart: any) => (
                <div id={bodypart.name} key={bodypart.id} className="scroll-mt-20 mb-6 sm:mb-8 not-first:border-t border-gray-200 not-first:pt-4 sm:not-first:pt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{bodypart.name}</h2>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {bodypart.exercices.map((exercice: any) => (
                      <ExerciceCard
                        key={exercice.id}
                        id={exercice.id}
                        exercice={exercice}
                        onEdit={handleEditClick}
                        onCompleted={handleCompleted}
                        bodypartSection={bodypart}
                      />
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onSuccess={handlePasswordSuccess}
        title={pendingAction === 'add' ? 'Accès Admin - Ajouter un exercice' : 'Accès Admin - Modifier un exercice'}
      />
    </section>
  );
}
