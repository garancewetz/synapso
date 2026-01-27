'use client';

import { useMemo } from 'react';
import type { Exercice } from '@/app/types';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { Badge, WeeklyCompletionIndicator } from '@/app/components/ui';
import { getDayName } from '@/app/utils/date.utils';
import { CameraIcon } from '@/app/components/ui/icons';

type Props = {
  exercice: Exercice;
  effectiveUserResetFrequency?: 'DAILY' | 'WEEKLY';
  onOpenMedia: (e: React.MouseEvent) => void;
};

export function ExerciceCardHeader({ exercice, effectiveUserResetFrequency, onOpenMedia }: Props) {
  const categoryStyle = useMemo(
    () => CATEGORY_COLORS[exercice.category],
    [exercice.category]
  );

  const hasMedia = useMemo(
    () => exercice.media && 
      ((exercice.media.photos && exercice.media.photos.length > 0) || exercice.media.video),
    [exercice.media]
  );

  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {hasMedia && (
          <button
            type="button"
            onClick={onOpenMedia}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded p-1 active:scale-95 shrink-0"
            aria-label="Voir les médias de l'exercice"
            title="Voir les médias"
          >
            <CameraIcon className="w-4 h-4" strokeWidth={2} />
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

