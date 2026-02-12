'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import type { Exercice } from '@/app/types';
import { Badge, WeeklyCompletionIndicator } from '@/app/components/ui';
import { getDayName } from '@/app/utils/date.utils';
import { EyeIcon } from '@/app/components/ui/icons';

type Props = {
  exercice: Exercice;
  effectiveUserResetFrequency?: 'DAILY' | 'WEEKLY';
  onOpenMedia: (e: React.MouseEvent) => void;
};

export function ExerciceCardHeader({ exercice, effectiveUserResetFrequency, onOpenMedia }: Props) {
  const hasMedia = useMemo(
    () => exercice.media && 
      exercice.media.photos && exercice.media.photos.length > 0,
    [exercice.media]
  );

  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {hasMedia && (
          <button
            type="button"
            onClick={onOpenMedia}
            className={clsx(
              'flex items-center justify-center',
              'w-7 h-7 rounded-md',
              'bg-transparent text-gray-400',
              'transition-all duration-200',
              'md:hover:bg-gray-50 md:hover:text-gray-500',
              'active:bg-gray-50 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
              'shrink-0',
              'touch-manipulation'
            )}
            aria-label="Voir les photos de l'exercice"
            title="Voir les photos"
          >
            <EyeIcon className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
        <h3 className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
          {exercice.name}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        {effectiveUserResetFrequency === 'WEEKLY' && 
         exercice.weeklyCompletions && 
         exercice.weeklyCompletions.length > 0 ? (
          <WeeklyCompletionIndicator 
            completions={exercice.weeklyCompletions}
          />
        ) : (
          exercice.completedToday && (
            <Badge variant="completed">
              {exercice.completedToday ? 'Fait' : getDayName(exercice.completedAt)}
            </Badge>
          )
        )}
      </div>
    </div>
  );
}

