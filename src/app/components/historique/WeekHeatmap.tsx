'use client';

import { isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { ActivityHeatmapCell } from './ActivityHeatmapCell';

type Props = {
  weekData: HeatmapDay[];
  progressDates?: Set<string>;
  onDayClick?: (day: HeatmapDay) => void;
  resetFrequency?: 'DAILY' | 'WEEKLY';
};

// Noms des jours de la semaine (lundi = début) - pour rythme hebdomadaire
const WEEKDAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Génère les labels pour les 7 derniers jours (rythme quotidien)
function getDailyLabels(days: HeatmapDay[]): string[] {
  return days.map((day) => {
    if (!day.date) return '';
    
    if (isToday(day.date)) {
      return 'Auj.';
    }
    if (isYesterday(day.date)) {
      return 'Hier';
    }
    // Pour les jours précédents, afficher le jour de la semaine court
    return format(day.date, 'EEE', { locale: fr }).substring(0, 3);
  });
}

export function WeekHeatmap({ weekData, progressDates, onDayClick, resetFrequency = 'WEEKLY' }: Props) {
  // Vérifier que nous avons exactement 7 jours
  if (weekData.length !== 7) {
    return null;
  }

  // Déterminer les labels selon le rythme
  const labels = resetFrequency === 'DAILY' 
    ? getDailyLabels(weekData)
    : WEEKDAY_NAMES;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {labels.map((label, index) => {
          const isWeekend = resetFrequency === 'WEEKLY' && index >= 5;
          const isToday = resetFrequency === 'DAILY' && index === 6;
          const isHighlighted = isWeekend || isToday;
          
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

      {/* Grille des jours - style calendrier compact avec emojis */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => (
          <ActivityHeatmapCell
            key={day.dateKey}
            day={day}
            progressDates={progressDates}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}

