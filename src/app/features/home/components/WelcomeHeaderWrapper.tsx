'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { getDateKey } from '@/app/utils/date.utils';
import { useQuery } from '@tanstack/react-query';
import { WelcomeHeader } from './WelcomeHeader';
import { useUser } from '@/app/contexts/UserContext';
import { useDayDetailModal } from '@/app/contexts/DayDetailModalContext';
import { useTodayCompletedCount } from '@/app/features/exercices';
import { useProgress } from '@/app/features/progress';
import {
  getCurrentWeekData,
  getLast7DaysData,
  getHeatmapData,
  calculateCurrentStreak,
  type HeatmapDay,
} from '@/app/features/historique';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { isToday } from 'date-fns';
import clsx from 'clsx';

export const WelcomeHeaderWrapper = memo(function WelcomeHeaderWrapper() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { openDayDetail } = useDayDetailModal();
  const completedToday = useTodayCompletedCount();
  const { selectedDate, isTimeMachineMode, referenceDateKey, referenceDate } = useTimeContext();
  const displayName = effectiveUser?.name || "";
  const resetFrequency = effectiveUser?.resetFrequency || null;
  const { progressList } = useProgress();

  const referenceDateForQuery = isTimeMachineMode && referenceDateKey ? referenceDateKey : undefined;

  const { data: history = [] } = useQuery({
    queryKey: queryKeys.history.list({ days: 40, referenceDate: referenceDateForQuery }),
    queryFn: () => fetchHistory({ days: 40, referenceDate: referenceDateForQuery }),
    enabled: !!effectiveUser,
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 2 * 60 * 1000,
  });

  const frequency = resetFrequency || 'DAILY';
  const weekData = useMemo(
    () =>
      frequency === 'WEEKLY'
        ? getCurrentWeekData(history, referenceDate)
        : getLast7DaysData(history, referenceDate),
    [history, frequency, referenceDate]
  );

  const heatmapData = useMemo(
    () => getHeatmapData(history, 40, referenceDate),
    [history, referenceDate]
  );

  const currentStreak = useMemo(
    () => calculateCurrentStreak(heatmapData, referenceDate),
    [heatmapData, referenceDate]
  );

  const progressDates = useMemo(() => {
    return new Set(
      progressList
        .map(p => getDateKey(new Date(p.createdAt)))
        .filter((k): k is string => k != null)
    );
  }, [progressList]);

  const handleDayClick = useCallback((day: HeatmapDay) => {
    openDayDetail(day);
  }, [openDayDetail]);

  const isHomePage = pathname === '/';

  if (!isHomePage || !effectiveUser || loading) {
    return null;
  }

  // Réduire le padding-top en mode sablier pour éviter les marges excessives
  const isBannerVisible = isTimeMachineMode && selectedDate && !isToday(selectedDate);

  return (
    <div className={clsx(
      'max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 md:px-6 lg:px-8',
      isBannerVisible ? 'pt-0' : 'pt-2 md:pt-4'
    )}>
      <WelcomeHeader
        userName={displayName}
        completedToday={completedToday}
        resetFrequency={resetFrequency}
        weekData={weekData}
        progressDates={progressDates}
        onDayClick={handleDayClick}
        currentStreak={currentStreak}
      />
    </div>
  );
});
