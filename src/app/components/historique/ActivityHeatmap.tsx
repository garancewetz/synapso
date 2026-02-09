'use client';

import { useMemo } from 'react';
import { getDay, getMonth, getYear, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import { CATEGORY_ICONS, CATEGORY_HEATMAP_COLORS, CATEGORY_ORDER, CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { ViewAllLink } from '@/app/components/ui/ViewAllLink';
import { ActivityHeatmapCell } from './ActivityHeatmapCell';
import { Card } from '@/app/components/ui/Card';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { formatShortDate } from '@/app/utils/date.utils';

type Props = {
  data: HeatmapDay[];
  currentStreak: number;
  showFullLink?: boolean;
  userName?: string;
  progressDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
};

// Noms des jours de la semaine (lundi = début)
const WEEKDAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function ActivityHeatmap({ data, currentStreak, showFullLink = true, userName, progressDates, onDayClick }: Props) {
  const { isTimeMachineMode, selectedDate } = useSelectedDate();
  
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

  // ⚡ NOUVEAU: Détecter les premières cellules de chaque mois pour afficher un label discret
  // Affiche le label sur : la première cellule du heatmap ET la première cellule de chaque mois
  const monthLabels = useMemo(() => {
    if (displayDays.length === 0) return new Map<number, string>();
    
    const labels = new Map<number, string>();
    let lastMonth = -1;
    let lastYear = -1;
    
    displayDays.forEach((day, index) => {
      if (day && day.date) {
        const month = getMonth(day.date);
        const year = getYear(day.date);
        
        // Toujours afficher sur la première cellule du heatmap
        if (index === 0) {
          labels.set(index, format(day.date, 'MMM', { locale: fr }));
          lastMonth = month;
          lastYear = year;
        } else {
          // Afficher sur la première cellule d'un nouveau mois
          if (month !== lastMonth || year !== lastYear) {
            labels.set(index, format(day.date, 'MMM', { locale: fr }));
            lastMonth = month;
            lastYear = year;
          }
        }
      }
    });
    
    return labels;
  }, [displayDays]);

  return (
    <Card variant="default" padding="md">
      {/* Header avec titre et streak */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          ✨ {userName ? `Ta progression, ${userName}` : 'Ma progression'}
        </h2>
        {currentStreak >= 2 && (
          <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            🔥 {currentStreak}j
          </span>
        )}
      </div>

      {/* Légende mode sablier */}
      {isTimeMachineMode && selectedDate && (
        <div className="mb-4 p-3 bg-indigo-900 border-2 border-indigo-700 rounded-lg shadow-lg"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        >
          <div className="flex items-center gap-2 text-sm text-white">
            <span className="text-lg text-amber-400">{NAVIGATION_EMOJIS.HOURGLASS}</span>
            <p className="font-semibold">
              Mode sablier actif : Tu es sur le <strong className="underline">{formatShortDate(selectedDate)}</strong>
            </p>
          </div>
          <p className="text-xs text-indigo-100 mt-1.5 ml-7">
            La cellule avec le sablier ⏳ est le jour sélectionné.
          </p>
        </div>
      )}

      {/* Barre de progression */}
      <div className="mb-5">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{daysWithExercises} jours actifs sur {totalDays}</span>
          <span className="font-semibold text-emerald-600">{progressPercent}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* En-têtes des jours de la semaine (mode semaine uniquement) */}
      {isWeekMode && (
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEKDAY_NAMES.map((name, index) => (
            <div 
              key={`weekday-${index}`} 
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
      <div className="grid grid-cols-7 gap-2 relative">
        {displayDays.map((day, index) => {
          const monthLabel = monthLabels.get(index);
          
          return (
            <div
              key={day ? day.dateKey : `empty-${index}`}
              className="relative"
            >
              {/* Badge discret du mois au-dessus de la première cellule, aligné à gauche */}
              {monthLabel && (
                <div 
                  className="absolute -top-6 left-0 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 z-10 whitespace-nowrap"
                  title={`${monthLabel} ${day?.date ? format(day.date, 'yyyy') : ''}`}
                >
                  {monthLabel}
                </div>
              )}
              <ActivityHeatmapCell
                day={day}
                progressDates={progressDates}
                onDayClick={onDayClick}
              />
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
          
          {/* Légende pour les progrès si affichés */}
          {progressDates && progressDates.size > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{PROGRESS_EMOJIS.STAR}</span>
                <span>Progrès</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bouton voir toute la progression */}
      {showFullLink && (
        <ViewAllLink 
          href="/historique"
          label="Voir toute la progression"
          emoji={NAVIGATION_EMOJIS.MAP}
        />
      )}
    </Card>
  );
}

