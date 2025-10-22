'use client';

import { useState, useEffect } from 'react';
import HistorySidebar from '@/app/components/organisms/HistorySidebar';
import Tag from '@/app/components/atoms/Tag';

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

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byBodypart: {} as Record<string, number>,
  });


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
    fetchHistory();
  }, []);



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
          <HistorySidebar />
          <div className="flex-1 h-screen flex flex-col">
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center px-4 pt-4">
                <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
              </div>
            </div>


            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
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
          </div>
        </div>
      </main>
    </div>
  );
}
