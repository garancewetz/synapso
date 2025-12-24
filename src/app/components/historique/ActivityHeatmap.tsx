'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import type { HeatmapDay } from '@/app/utils/historique.utils';

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  currentStreak: number;
}

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Couleurs pour les backgrounds et borders de la heatmap
const HEATMAP_CATEGORY_STYLES: Record<ExerciceCategory, { bg: string; border: string }> = {
  UPPER_BODY: { bg: 'bg-orange-50', border: 'border-orange-500' },
  CORE: { bg: 'bg-teal-50', border: 'border-teal-500' },
  LOWER_BODY: { bg: 'bg-blue-50', border: 'border-blue-500' },
  STRETCHING: { bg: 'bg-purple-50', border: 'border-purple-500' },
};

function getHeatmapStyle(
  count: number,
  dominantCategory: ExerciceCategory | null,
  _secondaryCategory: ExerciceCategory | null
): { bg: string; border: string } {
  if (count === 0) return { bg: 'bg-gray-50', border: 'border-gray-200' };
  if (!dominantCategory) return { bg: 'bg-gray-100', border: 'border-gray-300' };
  
  // Si on a deux catégories, on utilise le style de la dominante pour la bordure principale
  const style = HEATMAP_CATEGORY_STYLES[dominantCategory];
  return { bg: style.bg, border: style.border };
}

export function ActivityHeatmap({ data, currentStreak }: ActivityHeatmapProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📊 Tendances par jour (30 jours)
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
                  w-full h-8 sm:h-10 rounded-lg relative
                  ${(() => {
                    const style = getHeatmapStyle(day.count, day.dominantCategory, day.secondaryCategory);
                    if (day.secondaryCategory) {
                      // Deux catégories : pas de bordure globale, chaque moitié aura la sienne
                      return `${style.bg} border-0`;
                    }
                    return `${style.bg} ${style.border} border-2`;
                  })()}
                  ${day.isToday ? 'ring-2 ring-gray-400 ring-offset-1' : ''}
                  transition-all hover:scale-110 cursor-default
                `}
                title={
                  day.date 
                    ? `${format(day.date, 'd MMMM', { locale: fr })}: ${day.count} exercice${day.count > 1 ? 's' : ''}${day.dominantCategory ? ` - ${CATEGORY_LABELS[day.dominantCategory]}` : ''}${day.secondaryCategory ? ` / ${CATEGORY_LABELS[day.secondaryCategory]}` : ''}`
                    : ''
                }
              >
                {day.count > 0 && day.dominantCategory && (
                  <div className="flex items-center justify-center h-full">
                    {day.secondaryCategory ? (
                      // Deux catégories : diviser la case en deux avec bordures distinctes sur chaque moitié
                      <div className="w-full h-full flex">
                        <div 
                          className={`flex-1 flex items-center justify-center rounded-l-lg border-2 ${HEATMAP_CATEGORY_STYLES[day.dominantCategory].bg} ${HEATMAP_CATEGORY_STYLES[day.dominantCategory].border} border-r-0`}
                        >
                          <span className="text-base sm:text-lg">
                            {CATEGORY_ICONS[day.dominantCategory]}
                          </span>
                        </div>
                        <div 
                          className={`flex-1 flex items-center justify-center rounded-r-lg border-2 ${HEATMAP_CATEGORY_STYLES[day.secondaryCategory].bg} ${HEATMAP_CATEGORY_STYLES[day.secondaryCategory].border} border-l-0 `}
                        >
                          <span className="text-base sm:text-lg">
                            {CATEGORY_ICONS[day.secondaryCategory]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Une seule catégorie : centrer l'emoji
                      <span className="text-base sm:text-lg">
                        {CATEGORY_ICONS[day.dominantCategory]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          ))}
        </div>

        {/* Légende des couleurs */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-3 text-center">Légende</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-5 h-5 rounded bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-xs">—</span>
              </div>
              <span className="text-gray-600 font-medium">Aucun</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200">
              <div className="w-5 h-5 rounded bg-orange-50 border-2 border-orange-500 flex items-center justify-center">
                <span className="text-xs">{CATEGORY_ICONS.UPPER_BODY}</span>
              </div>
              <span className="text-gray-700 font-medium">{CATEGORY_LABELS.UPPER_BODY}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200">
              <div className="w-5 h-5 rounded bg-teal-50 border-2 border-teal-500 flex items-center justify-center">
                <span className="text-xs">{CATEGORY_ICONS.CORE}</span>
              </div>
              <span className="text-gray-700 font-medium">{CATEGORY_LABELS.CORE}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-5 h-5 rounded bg-blue-50 border-2 border-blue-500 flex items-center justify-center">
                <span className="text-xs">{CATEGORY_ICONS.LOWER_BODY}</span>
              </div>
              <span className="text-gray-700 font-medium">{CATEGORY_LABELS.LOWER_BODY}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200">
              <div className="w-5 h-5 rounded bg-purple-50 border-2 border-purple-500 flex items-center justify-center">
                <span className="text-xs">{CATEGORY_ICONS.STRETCHING}</span>
              </div>
              <span className="text-gray-700 font-medium">{CATEGORY_LABELS.STRETCHING}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

