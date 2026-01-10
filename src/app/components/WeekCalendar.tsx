'use client';

import { isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { ActivityHeatmapCell } from '@/app/components/historique/ActivityHeatmapCell';

type Props = {
  weekData: HeatmapDay[];
  progressDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
};

const WEEKDAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getDailyLabels(days: HeatmapDay[]): string[] {
  return days.map((day) => {
    if (!day.date) return '';
    
    if (isToday(day.date)) {
      return 'Auj.';
    }
    if (isYesterday(day.date)) {
      return 'Hier';
    }
    return format(day.date, 'EEE', { locale: fr }).substring(0, 3);
  });
}

export function WeekCalendar({ weekData, progressDates, onDayClick, resetFrequency = null }: Props) {
  if (!weekData || weekData.length !== 7) {
    return null;
  }

  const labels = resetFrequency === 'DAILY' 
    ? getDailyLabels(weekData)
    : WEEKDAY_NAMES;

  return (
    <div className="relative z-10 px-3 md:px-4">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {labels.map((label, index) => {
          const isWeekend = resetFrequency === 'WEEKLY' && index >= 5;
          const isTodayLabel = resetFrequency === 'DAILY' && index === 6;
          const isHighlighted = isWeekend || isTodayLabel;
          
          return (
            <div 
              key={`day-label-${index}`}
              className={clsx(
                'text-center text-xs font-semibold flex items-center justify-center',
                isHighlighted ? 'text-emerald-600' : 'text-gray-500'
              )}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => (
          <ActivityHeatmapCell
            key={day.dateKey}
            day={day}
            progressDates={progressDates}
            onDayClick={onDayClick}
            showDate={false}
          />
        ))}
      </div>
    </div>
  );
}

