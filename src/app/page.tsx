'use client';

import { useState, useEffect } from 'react';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import Panel from '@/app/components/molecules/Panel';
import ExerciceForm from '@/app/components/organisms/ExerciceForm';
import Sidebar from '@/app/components/organisms/Sidebar';
import Button from '@/app/components/atoms/Button';
import Tag from '@/app/components/atoms/Tag';

type Tab = 'exercices' | 'historique';

interface HistoryEntry {
  id: number;
  completedAt: string;
  exercice: {
    id: number;
    name: string;
    bodyparts: Array<{ id: number; name: string; color: string }>;
    equipments: string[];
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('exercices');
  const [exercices, setExercices] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byBodypart: {} as Record<string, number>,
  });
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

  const fetchHistory = () => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          calculateStats(data);
        } else {
          console.error('API error:', data);
          setHistory([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setHistory([]);
      });
  };

  const calculateStats = (data: HistoryEntry[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let thisWeek = 0;
    let thisMonth = 0;
    const byBodypart: Record<string, number> = {};

    data.forEach(entry => {
      const entryDate = new Date(entry.completedAt);
      
      if (entryDate >= startOfWeek) {
        thisWeek++;
      }
      
      if (entryDate >= startOfMonth) {
        thisMonth++;
      }

      entry.exercice.bodyparts.forEach(bp => {
        byBodypart[bp.name] = (byBodypart[bp.name] || 0) + 1;
      });
    });

    setStats({
      total: data.length,
      thisWeek,
      thisMonth,
      byBodypart,
    });
  };

  useEffect(() => {
    fetchExercices();
    fetchHistory();
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
    fetchHistory();
  };

  const groupByDate = () => {
    const grouped: Record<string, HistoryEntry[]> = {};
    
    history.forEach(entry => {
      const date = new Date(entry.completedAt).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });

    return grouped;
  };

  const groupedHistory = groupByDate();

  return (
    <div className="mx-auto min-h-screen">
      <main>
        <div className="flex">
          <Sidebar 
            bodyparts={allBodyparts()} 
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
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('exercices')}
                    className={`cursor-pointer px-6 py-3 font-medium transition-colors rounded-t-lg ${
                      activeTab === 'exercices'
                        ? 'bg-white text-gray-900 border-t border-x border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Exercices
                  </button>
                  <button
                    onClick={() => setActiveTab('historique')}
                    className={`cursor-pointer px-6 py-3 font-medium transition-colors rounded-t-lg ${
                      activeTab === 'historique'
                        ? 'bg-white text-gray-900 border-t border-x border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Historique
                  </button>
                </div>
                  <Button onClick={handleAddClick}>
                    Ajouter un exercice +
                  </Button>
                
              </div>
            </div>

            {activeTab === 'exercices' && exercicesByBodyPart().length > 0 && (

              <div className="p-6 overflow-y-auto flex-1 scroll-smooth">
                {exercicesByBodyPart()
                  .filter((bodypart: any) => bodypart.exercices.length > 0)
                  .map((bodypart: any) => (
                    <div id={bodypart.name} key={bodypart.id} className="mb-8 not-first:border-t border-gray-200 not-first:pt-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">{bodypart.name}</h2>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            )}

            {activeTab === 'historique' && (
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Cette semaine</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.thisWeek}</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Ce mois</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.thisMonth}</p>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Partie la plus travaillée</h3>
                    <p className="text-xl font-bold text-purple-600">
                      {Object.keys(stats.byBodypart).length > 0
                        ? Object.entries(stats.byBodypart).sort((a, b) => b[1] - a[1])[0][0]
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition par partie du corps</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.byBodypart)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{name}</span>
                          <span className="text-lg font-bold text-gray-900">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Historique détaillé</h2>
                  
                  {Object.keys(groupedHistory).length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <p className="text-gray-500">Aucun exercice complété pour le moment</p>
                    </div>
                  ) : (
                    Object.entries(groupedHistory).map(([date, entries]) => (
                      <div key={date} className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{date}</h3>
                        <div className="gap-3 grid grid-cols-2">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">{entry.exercice.name}</h4>
                                <div className="flex flex-wrap gap-2">
                                  {entry.exercice.bodyparts.map((bp) => (
                                    <Tag key={bp.id} color={bp.color}>
                                      {bp.name}
                                    </Tag>
                                  ))}
                                    {entry.exercice.equipments.map((equipment: string) => (
                                    <Tag key={equipment}>
                                      {equipment}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500 ml-4">
                                {new Date(entry.completedAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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
