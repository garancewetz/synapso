'use client';

import { createContext, useContext, useMemo, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelectedDate } from './SelectedDateContext';
import { useUser } from './UserContext';
import { queryKeys, fetchTodayCompletedCount } from '@/app/lib/api-queries';
import { getDateFromKey, getDateKey } from '@/app/utils/date.utils';

type TimeContextType = {
  referenceDate: Date; // Date de référence (aujourd'hui ou date sélectionnée)
  referenceDateKey: string; // Clé stable (yyyy-MM-dd) pour réactivité
  isTimeMachineMode: boolean; // Mode sablier actif
  isToday: boolean; // Est-ce que referenceDate = aujourd'hui ?
};

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: PropsWithChildren) {
  // ⚡ PERFORMANCE: Utiliser selectedDateKey directement (pas selectedDate)
  // Évite les recalculs de toDateString() et garantit des dépendances stables
  const { selectedDateKey, isTimeMachineMode, isTransitioning } = useSelectedDate();
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();

  // Calculer la date de référence UNE SEULE FOIS avec dépendances stables
  // ⚡ FIX: Pendant la transition, garder les anciennes données pour que l'animation se joue avant le changement
  const timeContextValue = useMemo<TimeContextType>(() => {
    // Par défaut : aujourd'hui
    let referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0);
    let referenceDateKey = referenceDate.toISOString().split('T')[0];
    
    // Mode sablier : utiliser la date sélectionnée
    // ⚡ FIX: Ne pas mettre à jour pendant la transition pour que l'animation se joue d'abord
    if (isTimeMachineMode && selectedDateKey && !isTransitioning) {
      // ⚡ OPTIMISATION: Utiliser getDateFromKey() pour éviter la duplication de logique
      const dateFromKey = getDateFromKey(selectedDateKey);
      if (dateFromKey) {
        referenceDate = dateFromKey;
        referenceDateKey = selectedDateKey;
      }
    }
    
    // ⚡ PERFORMANCE: isToday calculé sans appel à date-fns (plus rapide)
    // ⚡ FIX: Pendant la transition, garder l'état précédent
    const isTodayValue = isTransitioning ? !isTimeMachineMode : !isTimeMachineMode;
    
    return {
      referenceDate,
      referenceDateKey,
      isTimeMachineMode: isTransitioning ? false : isTimeMachineMode,
      isToday: isTodayValue,
    };
  }, [isTimeMachineMode, selectedDateKey, isTransitioning]); // Dépendances minimales et stables (strings)

  // ⚡ PERFORMANCE: Précharger les jours adjacents en arrière-plan avec TanStack Query
  // ⚡ OPTIMISATION: Utiliser un timeout pour éviter de précharger immédiatement après chaque changement
  // Cela évite de ralentir les opérations de complétion d'exercices
  useEffect(() => {
    if (!isTimeMachineMode || !selectedDateKey || !effectiveUser?.id) return;
    
    // Délai pour éviter de précharger immédiatement (permet aux autres opérations de se terminer)
    const timeoutId = setTimeout(() => {
      // Précharger les jours adjacents en arrière-plan
      // ⚡ OPTIMISATION: Utiliser getDateFromKey() et getDateKey() pour éviter la duplication
      const currentDate = getDateFromKey(selectedDateKey);
      if (!currentDate) return;
      
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const prevDayKey = getDateKey(prevDay);
      const nextDayKey = getDateKey(nextDay);
      
      if (!prevDayKey || !nextDayKey) return;
      
      // ⚡ TANSTACK QUERY: Précharger avec prefetchQuery (non-bloquant)
      queryClient.prefetchQuery({
        queryKey: queryKeys.todayCompletedCount.list({
          userId: effectiveUser.id,
          dateKey: prevDayKey,
        }),
        queryFn: () => fetchTodayCompletedCount({
          userId: effectiveUser.id,
          dateKey: prevDayKey,
        }),
      });
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.todayCompletedCount.list({
          userId: effectiveUser.id,
          dateKey: nextDayKey,
        }),
        queryFn: () => fetchTodayCompletedCount({
          userId: effectiveUser.id,
          dateKey: nextDayKey,
        }),
      });
    }, 500); // Délai de 500ms pour laisser les autres opérations se terminer
    
    return () => clearTimeout(timeoutId);
  }, [selectedDateKey, isTimeMachineMode, effectiveUser?.id, queryClient]);

  // ⚡ FIX ROBUSTE: Invalider TOUTES les queries liées à la date quand la date change
  // Cela garantit que toutes les données sont recalculées pour la nouvelle date de référence
  // Solution simple et robuste : invalider tout ce qui dépend de la date
  useEffect(() => {
    if (!effectiveUser?.id) return;
    
    // ⚡ SOLUTION ROBUSTE: Invalider toutes les queries qui dépendent de la date
    // Cela force le refetch avec la nouvelle referenceDateKey et met à jour toutes les données
    // Utiliser selectedDateKey comme dépendance car c'est la source de vérité qui change
    
    // 1. Invalider les exercices (contient completedToday calculé pour la date)
    queryClient.invalidateQueries({
      queryKey: queryKeys.exercices.all,
      refetchType: 'active', // Forcer le refetch immédiat des queries actives
    });
    
    // 2. Invalider le compteur d'exercices complétés (dépend de la date)
    queryClient.invalidateQueries({
      queryKey: queryKeys.todayCompletedCount.all,
      refetchType: 'active',
    });
    
    // 3. Invalider les stats par catégorie (dépendent de completedToday)
    queryClient.invalidateQueries({
      queryKey: queryKeys.categoryStats.all,
      refetchType: 'active',
    });
  }, [selectedDateKey, isTimeMachineMode, effectiveUser?.id, queryClient]);

  return (
    <TimeContext.Provider value={timeContextValue}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTimeContext() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTimeContext must be used within a TimeProvider');
  }
  return context;
}
