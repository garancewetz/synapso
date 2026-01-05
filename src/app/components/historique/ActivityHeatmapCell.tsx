'use client';

import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import { CATEGORY_ICONS, CATEGORY_HEATMAP_COLORS } from '@/app/constants/exercice.constants';
import { VICTORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import type { HeatmapDay } from '@/app/utils/historique.utils';

type Props = {
  day: HeatmapDay | null;
  victoryDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
  showDate?: boolean;
};

export function ActivityHeatmapCell({ day, victoryDates, onDayClick, showDate = true }: Props) {
  // Case vide pour l'alignement
  if (!day) {
    return <div className="aspect-square" />;
  }

  const isCurrentDay = day.date && isToday(day.date);
  const hasExercise = day.count > 0;
  const category = day.dominantCategory;
  const categoryStyle = category ? CATEGORY_HEATMAP_COLORS[category] : null;
  const hasVictory = victoryDates && day.dateKey && victoryDates.has(day.dateKey);
  
  const isClickable = onDayClick && (hasExercise || hasVictory);
  
  const tooltipText = day.date 
    ? `${format(day.date, 'd MMMM', { locale: fr })}: ${day.count} exercice${day.count > 1 ? 's' : ''}` 
    : '';

  return (
    <div 
      className="flex flex-col items-center"
      title={tooltipText}
    >
      {/* Case du jour */}
      <div 
        onClick={isClickable ? () => onDayClick(day) : undefined}
        className={clsx(
          'relative w-full aspect-square rounded-xl flex items-center justify-center',
          'transition-transform hover:scale-105',
          isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default',
          isCurrentDay 
            ? hasExercise && categoryStyle
              ? `${categoryStyle.bg} ring-2 ring-emerald-400 ring-offset-2 shadow-lg`
              : 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1 shadow-lg'
            : hasExercise && categoryStyle
              ? `${categoryStyle.bg} shadow-md`
              : 'bg-gray-100'
        )}
      >
        {/* Emoji ou indicateur */}
        {isCurrentDay ? (
          hasExercise && category ? (
            <span className="text-xl sm:text-2xl md:text-3xl w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">
              {CATEGORY_ICONS[category]}
            </span>
          ) : (
            <span className="text-xl sm:text-2xl md:text-3xl">
              {NAVIGATION_EMOJIS.PIN}
            </span>
          )
        ) : hasExercise && category ? (
          <span className="text-xl sm:text-2xl md:text-3xl w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">
            {CATEGORY_ICONS[category]}
          </span>
        ) : (
          <span className="text-gray-300 text-sm md:text-base">·</span>
        )}
        
        {/* Indicateur de victoire (étoile dorée) */}
        {hasVictory && (
          <span 
            className="absolute -top-2 -left-2 text-xl md:text-2xl drop-shadow-md"
            title="Une victoire notée ce jour !"
          >
            {VICTORY_EMOJIS.STAR}
          </span>
        )}
      </div>
      
      {/* Date sous la case */}
      {showDate && (
        <span className={clsx(
          'text-[10px] sm:text-xs mt-1 font-medium',
          isCurrentDay 
            ? 'text-emerald-600' 
            : hasExercise 
              ? 'text-gray-700' 
              : 'text-gray-400'
        )}>
          {isCurrentDay ? 'Auj.' : day.date && format(day.date, 'd', { locale: fr })}
        </span>
      )}
    </div>
  );
}

