'use client';

import { useState, useEffect } from 'react';
import type { HistoryEntry, Exercice } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { getStartOfPeriod } from '@/utils/resetFrequency.utils';
import { isAfter, isEqual } from 'date-fns';
import type { ExerciceCategory } from '@/types/exercice';

interface WeeklyProgressGaugesProps {
  userId: number;
  exercices: Exercice[];
}

export default function WeeklyProgressGauges({ userId, exercices }: WeeklyProgressGaugesProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsByCategory, setStatsByCategory] = useState<Record<ExerciceCategory, number>>({
    UPPER_BODY: 0,
    LOWER_BODY: 0,
    STRETCHING: 0,
    CORE: 0,
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/history?userId=${userId}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setHistory(data);
          
          // Calculer le début de la semaine
          const now = new Date();
          const startOfWeek = getStartOfPeriod('WEEKLY', now);
          
          // Filtrer les entrées de cette semaine et grouper par catégorie
          const stats: Record<ExerciceCategory, number> = {
            UPPER_BODY: 0,
            LOWER_BODY: 0,
            STRETCHING: 0,
            CORE: 0,
          };
          
          data.forEach((entry: HistoryEntry) => {
            const entryDate = new Date(entry.completedAt);
            
            // Vérifier si l'entrée est dans la semaine en cours
            if (isAfter(entryDate, startOfWeek) || isEqual(entryDate, startOfWeek)) {
              const category = entry.exercice.category;
              if (category && category in stats) {
                stats[category as ExerciceCategory]++;
              }
            }
          });
          
          setStatsByCategory(stats);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  if (loading) {
    return null;
  }

  // Vérifier s'il y a des données à afficher
  const hasData = Object.values(statsByCategory).some(count => count > 0);
  
  if (!hasData) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Fait cette semaine
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {CATEGORY_ORDER.map((category) => {
          const count = statsByCategory[category];
          const categoryStyle = CATEGORY_COLORS[category];
          const label = CATEGORY_LABELS[category];
          
          // Calculer le total d'exercices de cette catégorie
          const totalExercices = exercices.filter(e => e.category === category).length;
          
          // Calculer le pourcentage basé sur le total d'exercices de la catégorie
          const percentage = totalExercices > 0 ? Math.min((count / totalExercices) * 100, 100) : 0;
          
          // Ne pas afficher si la catégorie n'a pas d'exercices
          if (totalExercices === 0) return null;
          
          return (
            <div
              key={category}
              className="p-3 rounded-md bg-gray-50 border border-gray-200"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <span className={`text-base font-bold ${categoryStyle.text}`}>
                    {count}
                  </span>
                </div>
                
                {/* Jauge de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${categoryStyle.accent} transition-all duration-300 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
}

