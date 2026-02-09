'use client';

import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { formatShortDate } from '@/app/utils/date.utils';
import { isToday } from 'date-fns';
import { Button } from '@/app/components/ui';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import clsx from 'clsx';

export function SelectedDateBanner() {
  const { selectedDate, clearSelectedDate, isDateSelected } = useSelectedDate();

  // Ne pas afficher le bandeau si aucune date n'est sélectionnée ou si c'est aujourd'hui
  if (!isDateSelected || !selectedDate || isToday(selectedDate)) {
    return null;
  }

  const formattedDate = formatShortDate(selectedDate);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-400 border-b-2 border-amber-500 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-900 text-xl font-bold">{NAVIGATION_EMOJIS.HOURGLASS}</span>
            <p className="text-base font-bold text-amber-900">
              Tu es en train d&apos;ajouter des exercices pour le <strong className="underline">{formattedDate}</strong>
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={clearSelectedDate}
            className={clsx(
              'px-5 py-2.5 text-sm font-bold',
              'bg-white text-amber-900 border-2 border-amber-700',
              'hover:bg-amber-50 active:bg-amber-100',
              'shadow-md hover:shadow-lg transition-shadow'
            )}
          >
            Revenir à aujourd&apos;hui
          </Button>
        </div>
      </div>
    </div>
  );
}
