'use client';

import clsx from 'clsx';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { useCelebration } from '@/app/hooks/useCelebration';
import { WelcomeHeaderGreeting } from '@/app/components/WelcomeHeaderGreeting';
import { DailyGoalProgress } from '@/app/components/DailyGoalProgress';
import { WelcomeHeaderCelebration } from '@/app/components/WelcomeHeaderCelebration';
import { WeekCalendar } from '@/app/components/WeekCalendar';

const DAILY_GOAL = 5;

type Props = {
  userName: string;
  completedToday: number | null;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
  weekData?: HeatmapDay[];
  progressDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
};

export default function WelcomeHeader({ userName, completedToday, resetFrequency = null, weekData, progressDates, onDayClick }: Props) {
  const { showCelebration, animationKey } = useCelebration(completedToday);
  
  const isLoading = completedToday === null;
  const count = completedToday ?? 0;
  const isGoalReached = !isLoading && count >= DAILY_GOAL;

  return (
    <div 
      className={clsx(
        'relative bg-white rounded-2xl shadow-sm border py-5 md:p-6 mb-6 overflow-hidden transition-all duration-500',
        isGoalReached ? 'border-emerald-300 shadow-emerald-100' : 'border-gray-200'
      )}
    >
      <WelcomeHeaderCelebration 
        isGoalReached={isGoalReached}
        showCelebration={showCelebration}
        animationKey={animationKey}
      />

      <WelcomeHeaderGreeting userName={userName} resetFrequency={resetFrequency} />
      <DailyGoalProgress completedToday={completedToday} />
      
      {weekData && weekData.length === 7 && (
        <WeekCalendar 
          weekData={weekData}
          progressDates={progressDates}
          onDayClick={onDayClick}
          resetFrequency={resetFrequency}
        />
      )}
    </div>
  );
}
