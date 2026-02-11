'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subDays, format, startOfDay } from 'date-fns';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchExercices, fetchCategoryStats } from '@/app/lib/api-queries';

/**
 * Hook pour précharger les données des dates précédentes (hier, etc.)
 * ⚡ QUERY PREFETCHING: Charge les données en arrière-plan pour une navigation instantanée
 * 
 * Ce hook précharge automatiquement les données pour :
 * - Hier (date - 1 jour)
 * - Avant-hier (date - 2 jours)
 * - Il y a 3 jours (date - 3 jours)
 * 
 * Les données sont préchargées dès que l'utilisateur est disponible,
 * permettant une navigation fluide vers les dates précédentes.
 */
export function usePrefetchPreviousDates() {
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!effectiveUser) return;

    const resetFrequency = effectiveUser.resetFrequency || 'DAILY';
    const today = startOfDay(new Date());

    // Précharger les données pour les 3 jours précédents
    const daysToPrefetch = [1, 2, 3];

    daysToPrefetch.forEach((daysAgo) => {
      const targetDate = subDays(today, daysAgo);
      const dateKey = format(targetDate, 'yyyy-MM-dd');

      // ⚡ FIX TIMEZONE: Utiliser le dateKey directement au lieu de toISOString()
      // toISOString() convertit en UTC, ce qui décale d'un jour sur les serveurs UTC
      queryClient.prefetchQuery({
        queryKey: queryKeys.exercices.list({
          targetDate: dateKey,
        }),
        queryFn: () => fetchExercices({
          targetDate: dateKey,
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // ⚡ PREFETCH: Précharger les stats de catégories pour cette date
      queryClient.prefetchQuery({
        queryKey: queryKeys.categoryStats.list({
          userId: effectiveUser.id,
          resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
          referenceDateKey: dateKey,
        }),
        queryFn: () => fetchCategoryStats({
          userId: effectiveUser.id,
          resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
          referenceDateKey: dateKey,
        }),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    });
  }, [effectiveUser, queryClient]);
}

/**
 * Hook pour précharger les données d'une date spécifique
 * Utile pour précharger au survol d'un bouton de navigation
 * 
 * @param date - La date à précharger (optionnelle, si non fournie, ne fait rien)
 */
export function usePrefetchDate(date: Date | null) {
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!effectiveUser || !date) return;

    const resetFrequency = effectiveUser.resetFrequency || 'DAILY';
    // ⚡ FIX TIMEZONE: Utiliser le dateKey directement au lieu de toISOString()
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd');

    // ⚡ PREFETCH: Précharger les exercices pour cette date
    queryClient.prefetchQuery({
      queryKey: queryKeys.exercices.list({
        targetDate: dateKey,
      }),
      queryFn: () => fetchExercices({
        targetDate: dateKey,
      }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // ⚡ PREFETCH: Précharger les stats de catégories pour cette date
    queryClient.prefetchQuery({
      queryKey: queryKeys.categoryStats.list({
        userId: effectiveUser.id,
        resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
        referenceDateKey: dateKey,
      }),
      queryFn: () => fetchCategoryStats({
        userId: effectiveUser.id,
        resetFrequency: resetFrequency as 'DAILY' | 'WEEKLY',
        referenceDateKey: dateKey,
      }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [effectiveUser, date, queryClient]);
}
