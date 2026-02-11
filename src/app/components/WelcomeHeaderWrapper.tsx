'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { format, startOfDay, differenceInDays, subDays, isBefore } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { WelcomeHeader } from '@/app/components/WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useTodayCompletedCount } from '@/app/features/exercices';
import { useProgress } from '@/app/features/progress';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { getCurrentWeekData, getLast7DaysData, type HeatmapDay } from '@/app/features/historique';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';
import { useTimeContext } from '@/app/contexts/TimeContext';

export const WelcomeHeaderWrapper = memo(function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const completedToday = useTodayCompletedCount();
  const { selectedDate, isTimeMachineMode } = useSelectedDate();
  const { referenceDateKey } = useTimeContext();
  const displayName = effectiveUser?.name || "";
  const resetFrequency = effectiveUser?.resetFrequency || null;
  const { progressList } = useProgress();

  const referenceDateForQuery = isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;

  const { data: weekData = [] } = useQuery({
    queryKey: queryKeys.history.list({ days: 40, referenceDate: referenceDateForQuery }),
    queryFn: () => fetchHistory({ days: 40, referenceDate: referenceDateForQuery }),
    enabled: !!effectiveUser,
    select: (history) => {
      const frequency = resetFrequency || 'DAILY';
      
      let endDate: Date;
      if (isTimeMachineMode && selectedDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateNormalized = new Date(selectedDate);
        selectedDateNormalized.setHours(0, 0, 0, 0);
        
        if (frequency === 'WEEKLY') {
          endDate = selectedDateNormalized;
        } else {
          const daysDiff = differenceInDays(today, selectedDateNormalized);
          
          if (daysDiff <= 7) {
            const minStartDate = subDays(today, 6);
            if (isBefore(selectedDateNormalized, minStartDate)) {
              endDate = selectedDateNormalized;
            } else {
              endDate = today;
            }
          } else {
            endDate = selectedDateNormalized;
          }
        }
      } else {
        endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
      }
      
      return frequency === 'WEEKLY' 
        ? getCurrentWeekData(history, endDate)
        : getLast7DaysData(history, endDate);
    },
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 1000,
    gcTime: 2 * 60 * 1000,
  });

  const progressDates = useMemo(() => {
    return new Set(
      progressList.map(p => {
        const date = new Date(p.createdAt);
        return format(startOfDay(date), 'yyyy-MM-dd');
      })
    );
  }, [progressList]);

  const handleDayClick = useCallback((day: HeatmapDay) => {
    openDayDetail(day);
  }, [openDayDetail]);

  const isHomePage = pathname === '/';

  if (!isHomePage || !effectiveUser || loading) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 px-3 md:px-4">
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
        resetFrequency={resetFrequency}
        weekData={weekData}
        progressDates={progressDates}
        onDayClick={handleDayClick}
      />
    </div>
  );
});
