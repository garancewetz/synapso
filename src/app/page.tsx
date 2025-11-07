'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import BodyPartsNav from '@/app/components/molecules/BodyPartsNav';
import FiltersExercices from '@/app/components/organisms/FiltersExercices';
import Link from 'next/link';
import Button from '@/app/components/atoms/Button';
import type { Exercice, BodypartWithCount, BodypartWithExercices } from '@/types';

export default function Home() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
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
    }));
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

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}`);
  };

  const handleCompleted = () => {
    fetchExercices();
  };


  return (
    <section>

      <div className="flex flex-col mt-10">
        <div className='flex justify-center mb-6'>

        <Link href="/exercice/add" >
            <Button>
              Ajouter un exercice
            </Button>
          </Link>
        </div>


        <BodyPartsNav bodyparts={allBodyparts()} />

        <div className='flex '>
          <div className='w-60 p-4'>
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
          <div className="flex-1 p-6  flex-1 scroll-smooth space-y-6">
            {(() => {
              const filteredBodyParts = exercicesByBodyPart().filter((bodypart) => bodypart.exercices.length > 0);

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
                  ? `avec les filtres &quot;${activeFilters.join('&quot; et &quot;')}&quot;`
                  : '';

                return (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun exercice trouvé
                      </h3>
                      <p className="text-gray-600">
                        Aucun résultat n&apos;est disponible {filterText}.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Essayez de modifier vos filtres ou de réinitialiser la recherche.
                      </p>
                    </div>
                  </div>
                );
              }

              return filteredBodyParts.map((bodypart) => (
                <div id={bodypart.name} key={bodypart.id} className="scroll-mt-20 not-first:pt-4">
                  <h2 className="text-lg uppercase text-gray-900 mb-3 sm:mb-4 relative">
                    <span className='bg-white z-1 pr-3'>{bodypart.name}</span>
                    <hr className='my-4 border-gray-200 absolute w-full left-0 top-0 h-1 -z-1' />
                  </h2>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {bodypart.exercices.map((exercice) => (
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

    </section>
  );
}
