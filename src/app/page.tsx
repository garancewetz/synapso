'use client';

import { useState, useEffect } from 'react';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import Panel from '@/app/components/molecules/Panel';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import Sidebar from '@/app/components/organisms/Sidebar';
import BodyPartsNav from '@/app/components/molecules/BodyPartsNav';
import Button from '@/app/components/atoms/Button';



export default function Home() {
  const [exercices, setExercices] = useState<any[]>([]);
  const [editingExerciceId, setEditingExerciceId] = useState<number | null>(null);
  const [isAddingExercice, setIsAddingExercice] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

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

  const allEquipments = () => {
    const equipmentCount: { [key: string]: number } = {};
    exercices.forEach((exercice: any) => {
      if (exercice.equipments && Array.isArray(exercice.equipments) && exercice.equipments.length > 0) {
        exercice.equipments.forEach((equipment: string) => {
          equipmentCount[equipment] = (equipmentCount[equipment] || 0) + 1;
        });
      }
    });
    return Object.entries(equipmentCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
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

  const handleEditClick = (id: number) => {
    setEditingExerciceId(id);
  };

  const handleAddClick = () => {
    setIsAddingExercice(true);
  };

  const handleClosePanel = () => {
    setEditingExerciceId(null);
    setIsAddingExercice(false);
  };

  const handleSuccess = () => {
    setEditingExerciceId(null);
    setIsAddingExercice(false);
    window.location.reload();
  };

  const handleCompleted = () => {
    fetchExercices();
  };


  return (
    <div className="mx-auto min-h-screen">
      <main>
        <div className="flex">
          <Sidebar 
            equipments={allEquipments()}
            selectedEquipment={selectedEquipment}
            onEquipmentSelect={setSelectedEquipment}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalExercices={(() => {
              let filtered = exercices;
              if (selectedEquipment) {
                filtered = filtered.filter((exercice: any) => 
                  exercice.equipments && exercice.equipments.includes(selectedEquipment)
                );
              }
              if (statusFilter === 'completed') {
                filtered = filtered.filter((exercice: any) => exercice.completed);
              } else if (statusFilter === 'pending') {
                filtered = filtered.filter((exercice: any) => !exercice.completed);
              }
              return filtered.length;
            })()}
            completedCount={(() => {
              let filtered = exercices.filter((exercice: any) => exercice.completed);
              if (selectedEquipment) {
                filtered = filtered.filter((exercice: any) => 
                  exercice.equipments && exercice.equipments.includes(selectedEquipment)
                );
              }
              return filtered.length;
            })()}
            pendingCount={(() => {
              let filtered = exercices.filter((exercice: any) => !exercice.completed);
              if (selectedEquipment) {
                filtered = filtered.filter((exercice: any) => 
                  exercice.equipments && exercice.equipments.includes(selectedEquipment)
                );
              }
              return filtered.length;
            })()}
          />
          <div className=" flex-1  h-screen flex flex-col">
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center px-4 pt-4">
                <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
                <div className="flex gap-2">
                  <Button onClick={handleAddClick}>
                    Ajouter un exercice +
                  </Button>
                </div>
              </div>
            </div>

            <BodyPartsNav bodyparts={allBodyparts()} />

            <div className="p-6 overflow-y-auto flex-1 scroll-smooth bg-gray-50">
              {exercicesByBodyPart()
                .filter((bodypart: any) => bodypart.exercices.length > 0)
                .map((bodypart: any) => (
                  <div id={bodypart.name} key={bodypart.id} className="mb-8 not-first:border-t border-gray-200 not-first:pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{bodypart.name}</h2>
                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
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
                ))}
            </div>
          </div>
        </div>

        <Panel
          isOpen={editingExerciceId !== null}
          onClose={handleClosePanel}
          title="Modifier l'exercice"
        >
          {editingExerciceId && (
            <ExerciceForm
              exerciceId={editingExerciceId}
              onSuccess={handleSuccess}
              onCancel={handleClosePanel}
            />
          )}
        </Panel>

        <Panel
          isOpen={isAddingExercice}
          onClose={handleClosePanel}
          title="Ajouter un exercice"
        >
          <ExerciceForm
            onSuccess={handleSuccess}
            onCancel={handleClosePanel}
          />
        </Panel>
      </main>
    </div>
  );
}
