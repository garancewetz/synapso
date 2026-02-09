'use client';

import clsx from 'clsx';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { useCelebration } from '@/app/hooks/useCelebration';
import { WelcomeHeaderGreeting } from '@/app/components/WelcomeHeaderGreeting';
import { DailyGoalProgress } from '@/app/components/DailyGoalProgress';
import { WelcomeHeaderCelebration } from '@/app/components/WelcomeHeaderCelebration';
import { WeekCalendar } from '@/app/components/WeekCalendar';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { formatShortDate } from '@/app/utils/date.utils';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';

const DAILY_GOAL = 5;

type Props = {
  userName: string;
  completedToday: number | null;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
  weekData?: HeatmapDay[];
  progressDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
};

export function WelcomeHeader({ userName, completedToday, resetFrequency = null, weekData, progressDates, onDayClick }: Props) {
  const { showCelebration, animationKey } = useCelebration(completedToday);
  const { isTimeMachineMode, selectedDate } = useSelectedDate();
  
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

      {/* Badge sablier proéminent */}
      {isTimeMachineMode && selectedDate && (
        <div className="mb-3 px-3 py-2 bg-amber-50 border-2 border-amber-400 rounded-lg flex items-center gap-2">
          <span className="text-xl">{NAVIGATION_EMOJIS.HOURGLASS}</span>
          <span className="text-sm font-bold text-amber-900">
            Mode sablier - {formatShortDate(selectedDate)}
          </span>
        </div>
      )}

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
