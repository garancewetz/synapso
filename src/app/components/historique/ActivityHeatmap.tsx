'use client';

import { format, isToday, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import { CATEGORY_ICONS, CATEGORY_HEATMAP_COLORS, CATEGORY_ORDER, CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { VICTORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import ViewAllLink from '@/app/components/ui/ViewAllLink';

type Props = {
  data: HeatmapDay[];
  currentStreak: number;
  showFullLink?: boolean;
  userName?: string;
  victoryDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
};

// Noms des jours de la semaine (lundi = début)
const WEEKDAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function ActivityHeatmap({ data, currentStreak, showFullLink = true, userName, victoryDates, onDayClick }: Props) {
  // Filtrer les jours vides et ne garder que les vrais jours
  const realDays = data.filter(day => !day.isEmpty);
  
  // Mode semaine (roadmap complète) avec alignement sur les jours de la semaine
  const isWeekMode = !showFullLink;
  
  // Compter les jours avec exercices
  const daysWithExercises = realDays.filter(day => day.count > 0).length;
  const totalDays = realDays.length;
  const progressPercent = totalDays > 0 ? Math.round((daysWithExercises / totalDays) * 100) : 0;

  // Pour le mode semaine, organiser les jours par semaines avec les jours vides pour aligner
  const getWeekAlignedDays = () => {
    if (realDays.length === 0) return [];
    
    const result: (HeatmapDay | null)[] = [];
    
    // Trouver le premier jour et calculer son décalage depuis lundi
    const firstDay = realDays[0];
    if (firstDay.date) {
      const dayOfWeek = getDay(firstDay.date);
      // getDay retourne 0 pour dimanche, on veut lundi = 0
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      // Ajouter des cases vides pour aligner au lundi
      for (let i = 0; i < adjustedDay; i++) {
        result.push(null);
      }
    }
    
    // Ajouter tous les vrais jours
    realDays.forEach(day => result.push(day));
    
    return result;
  };

  const displayDays = isWeekMode ? getWeekAlignedDays() : realDays;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {/* Header avec titre et streak */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          ✨ {userName ? `Ton parcours, ${userName}` : 'Mon parcours'}
        </h2>
        {currentStreak >= 2 && (
          <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            🔥 {currentStreak}j
          </span>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mb-5">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{daysWithExercises} jours actifs sur {totalDays}</span>
          <span className="font-semibold text-emerald-600">{progressPercent}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* En-têtes des jours de la semaine (mode semaine uniquement) */}
      {isWeekMode && (
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAY_NAMES.map((name, index) => (
            <div 
              key={name} 
              className={clsx(
                'text-center text-xs font-semibold',
                index >= 5 ? 'text-emerald-600' : 'text-gray-500'
              )}
            >
              {name}
            </div>
          ))}
        </div>
      )}

      {/* Grille des jours - style calendrier compact avec emojis */}
      <div className="grid grid-cols-7 gap-2">
        {displayDays.map((day, index) => {
          // Case vide pour l'alignement
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isCurrentDay = day.date && isToday(day.date);
          const hasExercise = day.count > 0;
          const category = day.dominantCategory;
          const categoryStyle = category ? CATEGORY_HEATMAP_COLORS[category] : null;
          const hasVictory = victoryDates && day.dateKey && victoryDates.has(day.dateKey);
          
          const isClickable = onDayClick && (hasExercise || hasVictory);
          
          return (
            <div 
              key={day.dateKey}
              className="flex flex-col items-center"
              title={day.date ? `${format(day.date, 'd MMMM', { locale: fr })}: ${day.count} exercice${day.count > 1 ? 's' : ''}` : ''}
            >
              {/* Case du jour */}
              <div 
                onClick={isClickable ? () => onDayClick(day) : undefined}
                className={`
                  relative w-full aspect-square rounded-xl flex items-center justify-center
                  transition-transform hover:scale-105
                  ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                  ${isCurrentDay 
                    ? hasExercise && categoryStyle
                      ? `${categoryStyle.bg} ring-2 ring-emerald-400 ring-offset-2 shadow-lg`
                      : 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1 shadow-lg'
                    : hasExercise && categoryStyle
                      ? `${categoryStyle.bg} shadow-md`
                      : 'bg-gray-100'
                  }
                `}
              >
                {/* Emoji ou indicateur */}
                {isCurrentDay ? (
                  hasExercise && category ? (
                    <span className="text-xl sm:text-2xl md:text-3xl w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">{CATEGORY_ICONS[category]}</span>
                  ) : (
                    <span className="text-xl sm:text-2xl md:text-3xl">{NAVIGATION_EMOJIS.PIN}</span>
                  )
                ) : hasExercise && category ? (
                  <span className="text-xl sm:text-2xl md:text-3xl w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">{CATEGORY_ICONS[category]}</span>
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
              <span className={`
                text-[10px] sm:text-xs mt-1 font-medium
                ${isCurrentDay 
                  ? 'text-emerald-600' 
                  : hasExercise 
                    ? 'text-gray-700' 
                    : 'text-gray-400'
                }
              `}>
                {isCurrentDay ? 'Auj.' : day.date && format(day.date, 'd', { locale: fr })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Légende compacte */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-lg ${CATEGORY_HEATMAP_COLORS[category].bg} flex items-center justify-center`}>
                <span className="text-sm">{CATEGORY_ICONS[category]}</span>
              </div>
              <span>{CATEGORY_LABELS_SHORT[category]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton voir tout le parcours */}
      {showFullLink && (
        <ViewAllLink 
          href="/historique/roadmap"
          label="Voir tout le chemin parcouru"
          emoji={NAVIGATION_EMOJIS.MAP}
        />
      )}
    </div>
  );
}

