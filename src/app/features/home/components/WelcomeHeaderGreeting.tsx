'use client';

import { ClockIcon, CalendarIcon } from '@/app/components/ui/icons';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { RESET_FREQUENCY_COLORS } from '@/app/constants/ui.constants';
import { formatShortDate } from '@/app/utils/date.utils';
import clsx from 'clsx';

type Props = {
  userName: string;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
  currentStreak?: number;
};

function getTimeGreeting(referenceDate: Date) {
  const hour = referenceDate.getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function WelcomeHeaderGreeting({ userName, resetFrequency, currentStreak = 0 }: Props) {
  const { isLeftHanded } = useHandPreference();
  const { referenceDate, isTimeMachineMode, selectedDate } = useTimeContext();
  
  const greeting = getTimeGreeting(referenceDate);
  const greetingText = isTimeMachineMode && selectedDate
    ? `${greeting}, ${userName} (${formatShortDate(selectedDate)})`
    : `${greeting}, ${userName}`;

  return (
    <div className="mb-4 relative z-10 px-3 md:px-4">
      <div className={clsx('flex items-start gap-2 justify-between', isLeftHanded && 'flex-row-reverse')}>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
            {greetingText}
          </h1>
          {resetFrequency && (
            <span className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
              resetFrequency === 'DAILY' 
                ? `${RESET_FREQUENCY_COLORS.DAILY.bg} ${RESET_FREQUENCY_COLORS.DAILY.text}` 
                : `${RESET_FREQUENCY_COLORS.WEEKLY.bg} ${RESET_FREQUENCY_COLORS.WEEKLY.text}`
            )}>
              {resetFrequency === 'DAILY' ? (
                <>
                  <ClockIcon className="w-3 h-3" />
                  Rythme quotidien
                </>
              ) : (
                <>
                  <CalendarIcon className="w-3 h-3" />
                  Rythme hebdomadaire
                </>
              )}
            </span>
          )}
        </div>
        {currentStreak >= 2 && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 shrink-0"
            aria-label={`${currentStreak} jours d'activité en série`}
          >
            <span aria-hidden>🔥</span>
            <span>{currentStreak}j</span>
          </span>
        )}
      </div>
    </div>
  );
}
