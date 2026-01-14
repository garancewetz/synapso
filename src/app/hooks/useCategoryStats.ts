import { useState, useEffect, useCallback, useMemo } from 'react';
import type { HistoryEntry } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { apiCache, generateCacheKey } from '@/app/utils/api-cache.utils';

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
 * 
 * ⚡ PERFORMANCE: Utilise le paramètre `since` côté serveur pour éviter
 * de charger tout l'historique de l'utilisateur
 */
export function useCategoryStats({ 
  userId, 
  resetFrequency = 'DAILY' 
}: UseCategoryStatsOptions): UseCategoryStatsReturn {
  const [stats, setStats] = useState<Record<ExerciceCategory, number>>(initialStats);
  const [loading, setLoading] = useState(true);

  // Calculer la date de début de période une seule fois
  const startOfPeriod = useMemo(() => {
    return getStartOfPeriod(resetFrequency, new Date());
  }, [resetFrequency]);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // ⚡ PERFORMANCE: Filtrer côté serveur avec le paramètre `since`
      // Cela évite de charger tout l'historique de l'utilisateur
      const sinceParam = startOfPeriod.toISOString();
      const url = `/api/history?since=${encodeURIComponent(sinceParam)}`;
      
      // ⚡ PERFORMANCE: Vérifier le cache avant de faire la requête
      const cacheKey = generateCacheKey(url, { userId, resetFrequency, since: sinceParam });
      const cachedData = apiCache.get<HistoryEntry[]>(cacheKey);

      if (cachedData) {
        const newStats: Record<ExerciceCategory, number> = { ...initialStats };
        cachedData.forEach((entry: HistoryEntry) => {
          const category = entry.exercice.category;
          if (category && category in newStats) {
            newStats[category as ExerciceCategory]++;
          }
        });
        setStats(newStats);
        setLoading(false);
        return;
      }

      const response = await fetch(url, { credentials: 'include' });
      const data = await response.json();
      
      // ⚡ PERFORMANCE: Mettre en cache les données pour 30 secondes
      if (Array.isArray(data)) {
        apiCache.set(cacheKey, data, 30000);
      }
      
      if (Array.isArray(data)) {
        const newStats: Record<ExerciceCategory, number> = { ...initialStats };
        
        // Les données sont déjà filtrées côté serveur, on compte simplement
        data.forEach((entry: HistoryEntry) => {
          const category = entry.exercice.category;
          if (category && category in newStats) {
            newStats[category as ExerciceCategory]++;
          }
        });
        
        setStats(newStats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, startOfPeriod, resetFrequency]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refresh: fetchStats,
  };
}

