'use client';

import { memo } from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import { CATEGORY_ICONS, CATEGORY_HEATMAP_COLORS } from '@/app/constants/exercice.constants';
import { PROGRESS_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import type { HeatmapDay } from '@/app/utils/historique.utils';

type Props = {
  day: HeatmapDay | null;
  progressDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
  showDate?: boolean;
};

export const ActivityHeatmapCell = memo(function ActivityHeatmapCell({ day, progressDates, onDayClick, showDate = true }: Props) {
  // ⚡ PERFORMANCE: Appeler le hook AVANT tout return early (règle des hooks React)
  const { selectedDateKey, isTimeMachineMode } = useSelectedDate();
  
  // Case vide pour l'alignement
  if (!day) {
    return <div className="aspect-square" />;
  }
  const isCurrentDay = day.date && isToday(day.date);
  const hasExercise = day.count > 0;
  const category = day.dominantCategory;
  const hasProgress = progressDates && day.dateKey && progressDates.has(day.dateKey);
  
  // Détecter si le jour est sélectionné en mode sablier
  const isSelectedDay = isTimeMachineMode && selectedDateKey && day.dateKey === selectedDateKey;
  
  // Permettre le clic sur toutes les cases (même vides) pour pouvoir ajouter des exercices rétroactivement
  const isClickable = !!onDayClick;
  
  const tooltipText = day.date 
    ? `${format(day.date, 'd MMMM', { locale: fr })}: ${day.count} exercice${day.count > 1 ? 's' : ''}` 
    : '';

  // ⚡ FIX: Utiliser allCategories si dominantCategory n'est pas disponible
  const effectiveCategory = category || (day.allCategories && day.allCategories.length > 0 ? day.allCategories[0] : null);
  const effectiveCategoryStyle = effectiveCategory ? CATEGORY_HEATMAP_COLORS[effectiveCategory] : null;

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
          'transition-all duration-200',
          isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default',
          // ⚡ MODE SABLIER: Le jour sélectionné doit être TRÈS visible avec une bordure indigo pulsante avec lueur cosmique
          // Note: "aujourd'hui" ne peut jamais être sélectionné en mode sablier (mode sablier = passé uniquement)
          // ⚡ FIX: "Aujourd'hui" doit toujours afficher sa couleur dominante si elle a des exercices, même en mode sablier
          isCurrentDay
            ? hasExercise
              ? effectiveCategoryStyle
                // Si on a des exercices ET une catégorie, utiliser la couleur de la catégorie
                ? `${effectiveCategoryStyle.bg} ring-2 ring-emerald-400 ring-offset-2 shadow-lg`
                // Si on a des exercices mais pas de catégorie, utiliser le vert par défaut
                : 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1 shadow-lg'
              // Pas d'exercices : vert avec pin
              : 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1 shadow-lg'
            : isSelectedDay
              ? hasExercise && effectiveCategoryStyle
                ? `${effectiveCategoryStyle.bg} ring-4 ring-indigo-500 ring-offset-2 shadow-2xl shadow-indigo-500/50 animate-pulse`
                : 'bg-gray-100 ring-4 ring-indigo-500 ring-offset-2 shadow-2xl shadow-indigo-500/50 animate-pulse'
              : hasExercise && effectiveCategoryStyle
                ? `${effectiveCategoryStyle.bg} shadow-md`
                : 'bg-gray-100'
        )}
      >
        {/* Emoji ou indicateur */}
        {isCurrentDay ? (
          // ⚡ FIX: Utiliser effectiveCategory pour être cohérent avec la logique de couleur
          hasExercise ? (
            effectiveCategory ? (
              <span className="text-xl sm:text-2xl md:text-3xl w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">
                {CATEGORY_ICONS[effectiveCategory]}
              </span>
            ) : (
              // Fallback : afficher un indicateur générique si exercices sans catégorie
              <span className="text-xl sm:text-2xl md:text-3xl">✓</span>
            )
          ) : (
            <span className="text-xl sm:text-2xl md:text-3xl">
              {NAVIGATION_EMOJIS.PIN}
            </span>
          )
        ) : hasExercise ? (
          effectiveCategory ? (
            <span className="text-xl sm:text-2xl md:text-3xl w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">
              {CATEGORY_ICONS[effectiveCategory]}
            </span>
          ) : (
            // Fallback : afficher un indicateur générique si exercices sans catégorie
            <span className="text-gray-600 text-sm md:text-base">✓</span>
          )
        ) : (
          <span className="text-gray-300 text-sm md:text-base">·</span>
        )}
        
        {/* Indicateur de victoire (étoile dorée) */}
        {hasProgress && (
          <span 
            className="absolute -top-2 -left-2 text-xl md:text-2xl drop-shadow-md"
            title="Un progrès noté ce jour !"
          >
            {PROGRESS_EMOJIS.STAR}
          </span>
        )}
        
        {/* Indicateur sablier pour le jour sélectionné en mode sablier - badge en coin supérieur droit pour plus de visibilité */}
        {isSelectedDay && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-full p-2 shadow-2xl border-2 border-amber-400 z-20 flex items-center justify-center">
            <span className="text-base md:text-lg drop-shadow-lg font-bold text-white">
              {NAVIGATION_EMOJIS.HOURGLASS}
            </span>
          </div>
        )}
      </div>
      
      {/* Date sous la case */}
      {showDate && (
        <span className={clsx(
          'text-[10px] sm:text-xs mt-1 font-medium',
          isSelectedDay
            ? 'text-indigo-200 font-bold'
            : isCurrentDay 
              ? 'text-emerald-600' 
              : hasExercise 
                ? 'text-gray-700' 
                : 'text-gray-400'
        )}>
          {isSelectedDay 
            ? '⏳' 
            : isCurrentDay 
              ? 'Auj.' 
              : day.date && format(day.date, 'd', { locale: fr })}
        </span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // ⚡ PERFORMANCE: Comparaison ultra-rapide mais complète
  // ⚡ FIX: Comparer aussi les propriétés importantes de day pour détecter les changements
  const prevDay = prevProps.day;
  const nextDay = nextProps.day;
  
  // Si les références sont identiques, pas besoin de re-render
  if (prevDay === nextDay) {
    return true;
  }
  
  // Si l'un est null et pas l'autre, re-render
  if (!prevDay || !nextDay) {
    return false;
  }
  
  // Comparer les propriétés importantes qui affectent l'affichage
  return (
    prevDay.dateKey === nextDay.dateKey &&
    prevDay.count === nextDay.count &&
    prevDay.dominantCategory === nextDay.dominantCategory &&
    prevDay.secondaryCategory === nextDay.secondaryCategory &&
    prevDay.isToday === nextDay.isToday &&
    prevDay.isEmpty === nextDay.isEmpty &&
    prevProps.progressDates === nextProps.progressDates &&
    prevProps.onDayClick === nextProps.onDayClick &&
    prevProps.showDate === nextProps.showDate
  );
});

