'use client';

import { createContext, useContext, useMemo, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startOfDay, format } from 'date-fns';
import { useSelectedDate } from './SelectedDateContext';
import { useUser } from './UserContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
import { getDateFromKey, getDateKey } from '@/app/utils/date.utils';

type TimeContextType = {
  referenceDate: Date;
  referenceDateKey: string;
  isTimeMachineMode: boolean;
  isToday: boolean;
};

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: PropsWithChildren) {
  const { selectedDateKey, isTimeMachineMode } = useSelectedDate();
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();

  const timeContextValue = useMemo<TimeContextType>(() => {
    const today = new Date();
    let referenceDate = startOfDay(today);
    let referenceDateKey = format(referenceDate, 'yyyy-MM-dd');

    if (isTimeMachineMode && selectedDateKey) {
      const dateFromKey = getDateFromKey(selectedDateKey);
      if (dateFromKey) {
        referenceDate = dateFromKey;
        referenceDateKey = selectedDateKey;
      }
    }

    return {
      referenceDate,
      referenceDateKey,
      isTimeMachineMode,
      isToday: !isTimeMachineMode,
    };
  }, [isTimeMachineMode, selectedDateKey]);

  useEffect(() => {
    console.log('[DATE] 📅 Reference date changée:', {
      referenceDateKey: timeContextValue.referenceDateKey,
      isTimeMachineMode: timeContextValue.isTimeMachineMode,
    });
  }, [timeContextValue.referenceDateKey, timeContextValue.isTimeMachineMode]);

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
