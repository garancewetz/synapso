'use client';

import { createContext, useContext, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, isToday as isTodayFn } from 'date-fns';
import { useUser } from './UserContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
import { getDateFromKey, getDateKey } from '@/app/utils/date.utils';
import { validateDateKey } from '@/app/utils/dateValidation.utils';

type TimeContextType = {
  // Date de référence (aujourd'hui ou date sablier)
  referenceDate: Date;
  referenceDateKey: string;
  // Date sélectionnée (mode sablier)
  selectedDate: Date | null;
  selectedDateKey: string | null;
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  isDateSelected: boolean;
  // État du mode sablier
  isTimeMachineMode: boolean;
  isTransitioning: boolean;
  transitionType: 'enter' | 'exit' | null;
};

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'enter' | 'exit' | null>(null);

  // ── Date sélectionnée (depuis l'URL) ──────────────────────────────────

  const dateParam = searchParams.get('date');

  const selectedDateKey = useMemo(() => {
    const validDateKey = validateDateKey(dateParam);

    if (dateParam && !validDateKey) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      return null;
    }

    return validDateKey;
  }, [dateParam, pathname, router, searchParams]);

  const normalizedSelectedDate = useMemo(() => {
    if (!selectedDateKey) return null;
    return new Date(selectedDateKey + 'T00:00:00');
  }, [selectedDateKey]);

  const isTimeMachineMode = useMemo(() => {
    if (!normalizedSelectedDate) return false;
    return !isTodayFn(normalizedSelectedDate);
  }, [normalizedSelectedDate]);

  const isDateSelected = useMemo(() => normalizedSelectedDate !== null, [normalizedSelectedDate]);

  // ── Actions sur la date ───────────────────────────────────────────────

  const setSelectedDate = useCallback((date: Date | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (date) {
      const normalized = startOfDay(date);
      const dateKey = format(normalized, 'yyyy-MM-dd');
      const validDateKey = validateDateKey(dateKey);
      if (!validDateKey) {
        console.warn(`Date invalide pour le mode sablier: ${date.toISOString()}`);
        return;
      }
      params.set('date', validDateKey);
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
    } else {
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
    }
  }, [pathname, router, searchParams]);

  const clearSelectedDate = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  }, [pathname, router, searchParams]);

  // ── Date de référence (pour les hooks data) ──────────────────────────

  const referenceDate = useMemo(() => {
    if (isTimeMachineMode && selectedDateKey) {
      const dateFromKey = getDateFromKey(selectedDateKey);
      if (dateFromKey) return dateFromKey;
    }
    return startOfDay(new Date());
  }, [isTimeMachineMode, selectedDateKey]);

  const referenceDateKey = useMemo(() => {
    if (isTimeMachineMode && selectedDateKey) return selectedDateKey;
    return format(startOfDay(new Date()), 'yyyy-MM-dd');
  }, [isTimeMachineMode, selectedDateKey]);

  // ── Nettoyage quand l'utilisateur change ─────────────────────────────

  useEffect(() => {
    const handleUserChanged = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    };

    window.addEventListener('user-changed', handleUserChanged);
    return () => window.removeEventListener('user-changed', handleUserChanged);
  }, [pathname, router, searchParams]);

  // ── Transitions enter/exit sablier ────────────────────────────────────

  const previousIsTimeMachineMode = useRef(isTimeMachineMode);

  useEffect(() => {
    const wasTimeMachineMode = previousIsTimeMachineMode.current;
    const isNowTimeMachineMode = isTimeMachineMode;

    if (wasTimeMachineMode !== isNowTimeMachineMode) {
      setTransitionType(isNowTimeMachineMode ? 'enter' : 'exit');
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionType(null);
      }, 1500);
      previousIsTimeMachineMode.current = isNowTimeMachineMode;
      return () => clearTimeout(timer);
    }

    previousIsTimeMachineMode.current = isNowTimeMachineMode;
  }, [isTimeMachineMode]);

  // ── Prefetching jours adjacents en mode sablier ──────────────────────

  useEffect(() => {
    if (!isTimeMachineMode || !selectedDateKey || !effectiveUser?.id) return;

    const timeoutId = setTimeout(() => {
      const currentDate = getDateFromKey(selectedDateKey);
      if (!currentDate) return;

      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const prevDayKey = getDateKey(prevDay);
      const nextDayKey = getDateKey(nextDay);

      if (!prevDayKey || !nextDayKey) return;

      queryClient.prefetchQuery({
        queryKey: queryKeys.exercices.list({ targetDate: prevDayKey }),
        queryFn: () => fetchExercices({ targetDate: prevDayKey }),
      });

      queryClient.prefetchQuery({
        queryKey: queryKeys.exercices.list({ targetDate: nextDayKey }),
        queryFn: () => fetchExercices({ targetDate: nextDayKey }),
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedDateKey, isTimeMachineMode, effectiveUser?.id, queryClient]);

  // ── Valeur du contexte ────────────────────────────────────────────────

  const contextValue = useMemo<TimeContextType>(() => ({
    referenceDate,
    referenceDateKey,
    selectedDate: normalizedSelectedDate,
    selectedDateKey,
    setSelectedDate,
    clearSelectedDate,
    isDateSelected,
    isTimeMachineMode,
    isTransitioning,
    transitionType,
  }), [referenceDate, referenceDateKey, normalizedSelectedDate, selectedDateKey, setSelectedDate, clearSelectedDate, isDateSelected, isTimeMachineMode, isTransitioning, transitionType]);

  return (
    <TimeContext.Provider value={contextValue}>
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
