'use client';

import { createContext, useContext, useMemo, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startOfDay, format } from 'date-fns';
import { useSelectedDate } from './SelectedDateContext';
import { useUser } from './UserContext';
import { queryKeys, fetchTodayCompletedCount, fetchExercices } from '@/app/lib/api-queries';
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
  // ⚡ FIX BUG SABLIER: Mettre à jour referenceDate même pendant la transition pour que les données soient correctes
  // L'animation visuelle peut continuer, mais les données doivent être à jour immédiatement
  const timeContextValue = useMemo<TimeContextType>(() => {
    // Par défaut : aujourd'hui
    // ⚡ FIX PREPROD: Utiliser startOfDay pour normaliser correctement la date
    // En production, le timezone du serveur peut être différent, startOfDay garantit la cohérence
    const today = new Date();
    let referenceDate = startOfDay(today);
    let referenceDateKey = format(referenceDate, 'yyyy-MM-dd');
    
    // Mode sablier : utiliser la date sélectionnée
    // ⚡ FIX BUG SABLIER: Mettre à jour même pendant la transition pour que les gauges affichent les bonnes valeurs
    // L'animation visuelle (isTimeMachineMode) peut être retardée, mais les données doivent être à jour
    if (isTimeMachineMode && selectedDateKey) {
      // ⚡ OPTIMISATION: Utiliser getDateFromKey() pour éviter la duplication de logique
      const dateFromKey = getDateFromKey(selectedDateKey);
      if (dateFromKey) {
        referenceDate = dateFromKey;
        referenceDateKey = selectedDateKey;
      }
    }
    
    // ⚡ PERFORMANCE: isToday calculé sans appel à date-fns (plus rapide)
    // ⚡ FIX BUG SABLIER: Calculer isToday basé sur la vraie date de référence (pas la transition)
    const isTodayValue = !isTimeMachineMode;
    
    return {
      referenceDate,
      referenceDateKey,
      // ⚡ FIX BUG SABLIER: Garder isTimeMachineMode basé sur la vraie date (pas la transition)
      // L'animation visuelle peut être gérée ailleurs, mais les données doivent être correctes
      isTimeMachineMode,
      isToday: isTodayValue,
    };
  }, [isTimeMachineMode, selectedDateKey]); // ⚡ FIX: Retirer isTransitioning des dépendances pour que referenceDate se mette à jour immédiatement

  // ⚡ PERFORMANCE: Précharger les jours adjacents en arrière-plan avec TanStack Query
  // ⚡ OPTIMISATION: Utiliser un timeout pour éviter de précharger immédiatement après chaque changement
  // Cela évite de ralentir les opérations de complétion d'exercices
  // ⚡ AMÉLIORATION: Précharger aussi les exercices pour une navigation instantanée
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
      
      const prevDayISO = prevDay.toISOString();
      const nextDayISO = nextDay.toISOString();
      
      // ⚡ TANSTACK QUERY: Précharger le compteur d'exercices complétés
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

      // ⚡ AMÉLIORATION: Précharger aussi les exercices pour les jours adjacents
      // Cela permet une navigation instantanée sans attendre le chargement
      queryClient.prefetchQuery({
        queryKey: queryKeys.exercices.list({
          targetDate: prevDayISO,
        }),
        queryFn: () => fetchExercices({
          targetDate: prevDayISO,
        }),
      });
      
      queryClient.prefetchQuery({
        queryKey: queryKeys.exercices.list({
          targetDate: nextDayISO,
        }),
        queryFn: () => fetchExercices({
          targetDate: nextDayISO,
        }),
      });
    }, 500); // Délai de 500ms pour laisser les autres opérations se terminer
    
    return () => clearTimeout(timeoutId);
  }, [selectedDateKey, isTimeMachineMode, effectiveUser?.id, queryClient]);

  // ⚡ FIX ROBUSTE: Invalider TOUTES les queries liées à la date quand la date change
  // Cela garantit que toutes les données sont recalculées pour la nouvelle date de référence
  // Solution simple et robuste : invalider tout ce qui dépend de la date
  // ⚡ FIX BUG SABLIER: Invalider IMMÉDIATEMENT même pendant la transition pour que les données se mettent à jour
  // L'animation visuelle peut continuer, mais les données doivent être à jour
  useEffect(() => {
    if (!effectiveUser?.id) return;
    
    // ⚡ FIX BUG SABLIER CACHE: Supprimer complètement les entrées du cache pour forcer un nouveau fetch
    // Le problème est que refetchType: 'active' ne force pas le refetch si les données sont encore dans staleTime
    // En navigation privée, pas de cache donc ça fonctionne, mais en navigation normale le cache garde les anciennes données
    // Solution : supprimer les entrées du cache pour forcer un nouveau fetch immédiat
    
    // 1. Supprimer les exercices du cache (contient completedToday calculé pour la date)
    // removeQueries supprime complètement les entrées, forçant un nouveau fetch au prochain useQuery
    queryClient.removeQueries({
      queryKey: queryKeys.exercices.all,
    });
    
    // 2. Supprimer le compteur d'exercices complétés du cache (dépend de la date)
    queryClient.removeQueries({
      queryKey: queryKeys.todayCompletedCount.all,
    });
    
    // 3. Supprimer les stats par catégorie du cache (dépendent de completedToday)
    queryClient.removeQueries({
      queryKey: queryKeys.categoryStats.all,
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
