'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import BodyPartsNav from '@/app/components/molecules/BodyPartsNav';
import FiltersExercices from '@/app/components/organisms/FiltersExercices';
import SectionTitle from '@/app/components/molecules/SectionTitle';
import EmptyState from '@/app/components/molecules/EmptyState';
import Link from 'next/link';
import Button from '@/app/components/atoms/Button';
import Loader from '@/app/components/atoms/Loader';
import type { Exercice, BodypartWithCount, BodypartWithExercices } from '@/types';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadingExercices, setLoadingExercices] = useState(false);
  const router = useRouter();
  const { currentUser } = useUser();

  const fetchExercices = () => {
    if (!currentUser) return;
    
    setLoadingExercices(true);
    fetch(`/api/exercices?userId=${currentUser.id}`)
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
      })
      .finally(() => {
        setLoadingExercices(false);
      });
  };


  useEffect(() => {
    if (currentUser) {
      fetchExercices();
    } else {
      setLoadingExercices(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);



  const allBodyparts = (): BodypartWithCount[] => {
    const objectBodyparts: { [key: string]: BodypartWithCount } = exercices.flatMap((exercice) => exercice.bodyparts || []).reduce((acc, bodypart) => {
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
    }, {} as { [key: string]: BodypartWithCount });

    // Compter les exercices pour chaque bodypart en tenant compte des filtres
    let filteredExercices = exercices;

    // Filtre par équipement
    if (selectedEquipment) {
      filteredExercices = filteredExercices.filter((exercice) =>
        exercice.equipments && exercice.equipments.includes(selectedEquipment)
      );
    }

    // Filtre par statut
    if (statusFilter === 'completed') {
      filteredExercices = filteredExercices.filter((exercice) => exercice.completed);
    } else if (statusFilter === 'pending') {
      filteredExercices = filteredExercices.filter((exercice) => !exercice.completed);
    }

    filteredExercices.forEach((exercice) => {
      exercice.bodyparts?.forEach((bp) => {
        if (objectBodyparts[bp.name]) {
          objectBodyparts[bp.name].count++;
        }
      });
    });

    return Object.values(objectBodyparts)
      .filter((bodypart) => bodypart.count > 0)
      .sort((a, b) => b.count - a.count);
  }


  const exercicesByBodyPart = (): BodypartWithExercices[] => {
    const bodyparts = allBodyparts();
    let filteredExercices = exercices;

    // Filtre par équipement
    if (selectedEquipment) {
      filteredExercices = filteredExercices.filter((exercice) =>
        exercice.equipments && exercice.equipments.includes(selectedEquipment)
      );
    }

    // Filtre par statut
    if (statusFilter === 'completed') {
      filteredExercices = filteredExercices.filter((exercice) => exercice.completed);
    } else if (statusFilter === 'pending') {
      filteredExercices = filteredExercices.filter((exercice) => !exercice.completed);
    }

    return bodyparts.map((bodypart) => ({
      ...bodypart,
      exercices: filteredExercices.filter((exercice) =>
        exercice.bodyparts?.some((bp) => bp.id === bodypart.id)
      )
    })).filter((bodypart) => bodypart.exercices.length > 0);
  }

  const getEquipments = () => {
    const equipmentCounts: { [key: string]: number } = {};

    exercices.forEach((exercice) => {
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
    const completedCount = exercices.filter((exercice) => exercice.completed).length;
    const pendingCount = totalExercices - completedCount;

    return { totalExercices, completedCount, pendingCount };
  }

  const getTodayCompletedCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return exercices.filter((exercice) => {
      if (!exercice.completedAt) return false;
      const completedDate = new Date(exercice.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    }).length;
  }

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}`);
  };

  const handleCompleted = () => {
    fetchExercices();
  };


  return (
    <section>

      <div className="mt-4 md:mt-10">
        {currentUser && (
          <div className="px-4 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              C'est parti {currentUser.name} !
            </h2>
            {!loadingExercices && getTodayCompletedCount() > 0 && (
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Déjà {getTodayCompletedCount()} exercice{getTodayCompletedCount() > 1 ? 's' : ''} fait{getTodayCompletedCount() > 1 ? 's' : ''} aujourd'hui !
              </p>
            )}
          </div>
        )}
        <div className='flex gap-2 mb-4 md:mb-6 px-4 md:justify-center'>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </button>
          <Link href="/exercice/add" className="flex-1 md:flex-initial">
            <Button className="w-full md:w-auto text-sm md:text-base py-2.5 md:py-2">
              Ajouter un exercice
            </Button>
          </Link>
        </div>


        <BodyPartsNav bodyparts={allBodyparts()} />

        <div className='flex'>
          <div className='hidden md:block w-60 p-4'>
            <div className='sticky top-20 space-y-4 flex flex-col'>
     
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
          <div className="flex-1 p-4 md:p-6 scroll-smooth space-y-6">
            {loadingExercices ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader size="large" />
              </div>
            ) : (
              (() => {
                const filteredBodyParts = exercicesByBodyPart().filter((bodypart) => bodypart.exercices.length > 0);
                
                // Récupérer tous les exercices filtrés
                let filteredExercices = exercices;

                // Filtre par équipement
                if (selectedEquipment) {
                  filteredExercices = filteredExercices.filter((exercice) =>
                    exercice.equipments && exercice.equipments.includes(selectedEquipment)
                  );
                }

                // Filtre par statut
                if (statusFilter === 'completed') {
                  filteredExercices = filteredExercices.filter((exercice) => exercice.completed);
                } else if (statusFilter === 'pending') {
                  filteredExercices = filteredExercices.filter((exercice) => !exercice.completed);
                }

                // Séparer les exercices épinglés (avec vérification pour s'assurer que pinned existe)
                const pinnedExercices = filteredExercices.filter((exercice) => exercice.pinned === true);

                if (filteredBodyParts.length === 0 && pinnedExercices.length === 0) {
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
                    <EmptyState
                      icon="🔍"
                      title="Aucun exercice trouvé"
                      message={`Aucun résultat n'est disponible ${filterText}.`}
                      subMessage="Essayez de modifier vos filtres ou de réinitialiser la recherche."
                    />
                  );
                }

                return (
                  <>
                    {/* Section des exercices épinglés */}
                    {pinnedExercices.length > 0 && (
                      <div className="mb-8">
                        <SectionTitle>📌 Exercices épinglés</SectionTitle>
                        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                          {pinnedExercices.map((exercice) => {
                            // Trouver le bodypart pour cet exercice (prendre le premier)
                            const bodypart = exercice.bodyparts && exercice.bodyparts.length > 0
                              ? filteredBodyParts.find((bp) => bp.id === exercice.bodyparts[0].id) || filteredBodyParts[0]
                              : filteredBodyParts[0];

                            return (
                              <ExerciceCard
                                key={exercice.id}
                                id={exercice.id}
                                exercice={exercice}
                                onEdit={handleEditClick}
                                onCompleted={handleCompleted}
                                bodypartSection={bodypart || { id: 0, name: '', color: '', count: 0 }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section des exercices par bodypart (non épinglés) */}
                    {filteredBodyParts.map((bodypart) => {
                      // Filtrer pour ne garder que les exercices non épinglés de ce bodypart
                      const unpinnedBodypartExercices = bodypart.exercices.filter((exercice) => exercice.pinned !== true);
                      
                      if (unpinnedBodypartExercices.length === 0) {
                        return null;
                      }

                      return (
                        <div id={bodypart.name} key={bodypart.id} className="scroll-mt-20 not-first:pt-4">
                          <SectionTitle>{bodypart.name}</SectionTitle>
                          <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                            {unpinnedBodypartExercices.map((exercice) => (
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
                      );
                    })}
                  </>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/20 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filtres</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
        </div>
      )}

    </section>
  );
}
