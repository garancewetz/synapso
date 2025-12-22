'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HeatmapDay {
  date: Date | null;
  dateKey: string;
  count: number;
  isToday: boolean;
  isEmpty: boolean;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  currentStreak: number;
}

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getHeatmapColor(count: number): string {
  if (count === 0) return 'bg-gray-100';
  if (count === 1) return 'bg-emerald-200';
  if (count <= 3) return 'bg-emerald-400';
  return 'bg-emerald-600';
}

export function ActivityHeatmap({ data, currentStreak }: ActivityHeatmapProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        📅 Ta régularité (30 jours)
        {currentStreak >= 3 && (
          <span className="text-sm font-normal text-amber-500 ml-2">
            🔥 {currentStreak}j
          </span>
        )}
      </h2>
      
      <div className="flex flex-col gap-1">
        {/* Légende des jours */}
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-400 mb-1">
          {WEEKDAY_LABELS.map((day, i) => (
            <span key={i} className="w-full mx-auto text-center">{day}</span>
          ))}
        </div>
        
        {/* Grille heatmap */}
        <div className="grid grid-cols-7 gap-1">
          {data.map((day) => (
            day.isEmpty ? (
              <div key={day.dateKey} className="w-full h-8 sm:h-10" />
            ) : (
              <div
                key={day.dateKey}
                className={`
                  w-full h-8 sm:h-10 rounded-lg flex items-center justify-center
                  ${getHeatmapColor(day.count)}
                  ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  transition-all hover:scale-110 cursor-default
                `}
                title={day.date ? `${format(day.date, 'd MMMM', { locale: fr })}: ${day.count} exercice${day.count > 1 ? 's' : ''}` : ''}
              >
                {day.count > 0 && (
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {day.count > 9 ? '9+' : day.count}
                  </span>
                )}
              </div>
            )
          ))}
        </div>

        {/* Légende des couleurs */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span>Moins</span>
          <div className="w-4 h-4 rounded bg-gray-100" />
          <div className="w-4 h-4 rounded bg-emerald-200" />
          <div className="w-4 h-4 rounded bg-emerald-400" />
          <div className="w-4 h-4 rounded bg-emerald-600" />
          <span>Plus</span>
        </div>
      </div>
    </div>
  );
}

