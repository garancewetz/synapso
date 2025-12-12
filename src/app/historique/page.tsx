'use client';

import { useState, useEffect, useCallback } from 'react';
import Tag from '@/app/components/atoms/Tag';
import type { HistoryEntry } from '@/types';
import { useUser } from '@/contexts/UserContext';

export default function HistoriquePage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byBodypart: {} as Record<string, number>,
  });
  const { currentUser } = useUser();

  const calculateStats = useCallback((data: HistoryEntry[]) => {
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
  }, []);

  const fetchHistory = useCallback(() => {
    if (!currentUser) return;
    
    fetch(`/api/history?userId=${currentUser.id}`)
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
  }, [calculateStats, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [fetchHistory, currentUser]);



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
    <div className="max-w-5xl mx-auto pt-2 md:pt-4">
      <div className="p-3 sm:p-6 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Total</h3>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                
                <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Cette semaine</h3>
                  <p className="text-xl sm:text-3xl font-bold text-blue-600">{stats.thisWeek}</p>
                </div>
                
                <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Ce mois</h3>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.thisMonth}</p>
                </div>

                <div className="bg-white p-3 sm:p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Partie la plus travaillée</h3>
                  <p className="text-sm sm:text-xl font-bold text-purple-600">
                    {Object.keys(stats.byBodypart).length > 0
                      ? Object.entries(stats.byBodypart).sort((a, b) => b[1] - a[1])[0][0]
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Répartition par partie du corps</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(stats.byBodypart)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">{name}</span>
                        <span className="text-base sm:text-lg font-bold text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Historique détaillé</h2>
                
                {Object.keys(groupedHistory).length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
                    <p className="text-gray-500 text-sm sm:text-base">Aucun exercice complété pour le moment</p>
                  </div>
                ) : (
                  Object.entries(groupedHistory).map(([date, entries]) => (
                    <div key={date} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 capitalize">{date}</h3>
                      <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{entry.exercice.name}</h4>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {entry.exercice.bodyparts.map((bp) => (
                                  <Tag key={bp.id} color={bp.color} className="text-xs sm:text-sm">
                                    {bp.name}
                                  </Tag>
                                ))}
                                {entry.exercice.equipments.map((equipment: string) => (
                                  <Tag key={equipment} className="text-xs sm:text-sm">
                                    {equipment}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500 ml-2 sm:ml-4">
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
  );
}
