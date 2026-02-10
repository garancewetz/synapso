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
    <>
      {/* Announcement pour les lecteurs d'écran */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        Mode sablier activé. Tu es sur le {formattedDate}. 
        Tu peux consulter les exercices de ce jour ou en ajouter de nouveaux.
        Utilise le bouton &quot;Revenir à aujourd&apos;hui&quot; pour sortir du mode.
      </div>
      
      <div 
        role="banner"
        aria-label="Mode sablier actif"
        className="fixed top-0 left-0 right-0 z-50 bg-indigo-900 border-b-2 border-indigo-700 shadow-lg"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-amber-400 text-lg sm:text-xl font-bold drop-shadow-lg shrink-0">{NAVIGATION_EMOJIS.HOURGLASS}</span>
                <p className="text-sm sm:text-base font-bold text-white truncate">
                  Tu es sur le <strong className="underline">{formattedDate}</strong>
                </p>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 ml-6 sm:ml-8 line-clamp-1">
                Tu peux consulter les exercices de ce jour ou en ajouter de nouveaux
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={clearSelectedDate}
              className={clsx(
                'px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold shrink-0',
                'bg-white text-indigo-900 border-2 border-indigo-600',
                'hover:bg-indigo-50 active:bg-indigo-100',
                'shadow-md hover:shadow-lg transition-shadow',
                'whitespace-nowrap'
              )}
            >
              <span className="hidden sm:inline">Revenir à aujourd&apos;hui</span>
              <span className="sm:hidden">Aujourd&apos;hui</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
