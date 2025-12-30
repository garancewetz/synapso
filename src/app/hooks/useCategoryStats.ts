import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { isAfter, isEqual } from 'date-fns';

type ResetFrequency = 'DAILY' | 'WEEKLY';

interface UseCategoryStatsOptions {
  userId: number | null;
  resetFrequency?: ResetFrequency;
}

interface UseCategoryStatsReturn {
  stats: Record<ExerciceCategory, number>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const initialStats: Record<ExerciceCategory, number> = {
  UPPER_BODY: 0,
  LOWER_BODY: 0,
  STRETCHING: 0,
  CORE: 0,
};

/**
 * Hook pour charger les statistiques d'exercices complétés par catégorie
 * pour la période en cours (jour ou semaine selon resetFrequency)
 */
export function useCategoryStats({ 
  userId, 
  resetFrequency = 'DAILY' 
}: UseCategoryStatsOptions): UseCategoryStatsReturn {
  const [stats, setStats] = useState<Record<ExerciceCategory, number>>(initialStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/history?userId=${userId}`, { credentials: 'include' });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const now = new Date();
        const startOfPeriod = getStartOfPeriod(resetFrequency, now);
        
        const newStats: Record<ExerciceCategory, number> = { ...initialStats };
        
        data.forEach((entry: HistoryEntry) => {
          const entryDate = new Date(entry.completedAt);
          
          if (isAfter(entryDate, startOfPeriod) || isEqual(entryDate, startOfPeriod)) {
            const category = entry.exercice.category;
            if (category && category in newStats) {
              newStats[category as ExerciceCategory]++;
            }
          }
        });
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, resetFrequency]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refresh: fetchStats,
  };
}

