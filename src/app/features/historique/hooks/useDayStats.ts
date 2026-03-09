'use client';

import { useMemo } from 'react';
import { useDayData } from './useDayData';
import { useTimeContext } from '@/app/contexts/TimeContext';
import type { ExerciceCategory } from '@/app/types/exercice';

type UseDayStatsReturn = {
  stats: Record<ExerciceCategory, number>;
  loading: boolean;
  error: Error | null;
};

const initialStats: Record<ExerciceCategory, number> = {
  UPPER_BODY: 0,
  LOWER_BODY: 0,
  STRETCHING: 0,
  CORE: 0,
  MAXILLO_FACIAL: 0,
};

/**
 * Hook pour calculer les stats par catégorie pour une date spécifique
 * 
 * @param date - Date pour laquelle calculer les stats (Date ou string dateKey 'yyyy-MM-dd')
 * Si null, utilise la date de référence depuis TimeContext
 * 
 * ⚡ SIMPLICITÉ: Utilise useDayData pour récupérer les exercices complétés ce jour-là
 * ⚡ DIFFÉRENCE avec useCategoryStats: 
 *   - useCategoryStats: compte les exercices "faits" selon resetFrequency (DAILY/WEEKLY)
 *   - useDayStats: compte les exercices complétés le jour exact (depuis History)
 * 
 * @example
 * ```tsx
 * // Stats pour une date spécifique
 * const { stats, loading } = useDayStats('2026-01-15');
 * 
 * // Stats pour la date de référence actuelle (mode sablier)
 * const { stats, loading } = useDayStats(null);
 * ```
 */
export function useDayStats(date: Date | string | null = null): UseDayStatsReturn {
  const { referenceDate } = useTimeContext();
  
  // Utiliser la date fournie ou la date de référence
  const targetDate = date ?? referenceDate;
  
  // ⚡ SIMPLICITÉ: Utiliser useDayData pour récupérer les exercices complétés ce jour-là
  const { exercises, loading, error } = useDayData(targetDate);
  
  // Calculer les stats par catégorie
  const stats = useMemo(() => {
    const newStats: Record<ExerciceCategory, number> = { ...initialStats };
    
    if (loading || !exercises.length) {
      return newStats;
    }
    
    // Compter les exercices par catégorie
    exercises.forEach((exercise) => {
      if (exercise.category && exercise.category in newStats) {
        newStats[exercise.category as ExerciceCategory]++;
      }
    });
    
    return newStats;
  }, [exercises, loading]);
  
  return {
    stats,
    loading,
    error,
  };
}
