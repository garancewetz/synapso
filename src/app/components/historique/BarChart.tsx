'use client';

import { memo, type ReactNode } from 'react';
import { ComposedChart, Bar, Scatter, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import type { HeatmapDay } from '@/app/utils/historique.utils';

type Props = {
  data: HeatmapDay[];
  currentStreak: number;
  victoryCountByDate?: Map<string, number>;
  filterSlot?: ReactNode;
};

function getBarColor(count: number, isToday: boolean): string {
  if (isToday) return '#3B82F6';
  if (count === 0) return '#F3F4F6';
  if (count === 1) return '#6EE7B7';
  if (count <= 3) return '#34D399';
  return '#10B981';
}

export const BarChart = memo(function BarChart({ data, currentStreak, victoryCountByDate, filterSlot }: Props) {
  // Formater les données pour le graphique (inclut tous les jours)
  const chartData = data.map(day => {
      const victoryCount = victoryCountByDate && day.dateKey ? victoryCountByDate.get(day.dateKey) || 0 : 0;
      return {
        date: day.date,
        dateKey: day.dateKey,
        count: day.count || 0,
        isToday: day.isToday,
        dayNumber: day.date ? format(day.date, 'd') : '',
        victoryCount,
        // Valeur pour le scatter: on met la valeur au-dessus de la barre si victoire
        victoryMarker: victoryCount > 0 ? (day.count || 0) + 0.5 : null,
      };
    });

  // Calculer l'intervalle d'affichage des labels en fonction du nombre de jours
  const xAxisInterval = (() => {
    const dayCount = chartData.length;
    if (dayCount <= 7) return 0; // Semaine: afficher tous les jours
    if (dayCount <= 14) return 1; // 2 semaines: 1 jour sur 2
    if (dayCount <= 30) return Math.floor(dayCount / 8); // Mois: ~8 labels
    return Math.floor(dayCount / 10); // Année: ~10 labels
  })();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📅 Ta régularité
        {currentStreak >= 3 && (
          <span className="text-sm font-normal text-amber-500 ml-2">
            🔥 {currentStreak}j
          </span>
        )}
      </h2>
      
      {/* Filtre optionnel sous le titre */}
      {filterSlot && <div className="mb-4">{filterSlot}</div>}
      
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="dayNumber"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval={xAxisInterval}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              allowDecimals={false}
            />
            {/* Barres pour la régularité */}
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.count, entry.isToday)}
                />
              ))}
            </Bar>
            {/* Points dorés pour les victoires */}
            <Scatter 
              dataKey="victoryMarker" 
              fill="#F59E0B"
              shape={(props: { cx?: number; cy?: number; payload?: { victoryMarker: number | null; victoryCount: number } }) => {
                if (!props.payload?.victoryMarker || !props.payload?.victoryCount) return <></>;
                const count = props.payload.victoryCount;
                
                // Afficher plusieurs étoiles empilées si plusieurs victoires
                return (
                  <g>
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <text
                        key={i}
                        x={props.cx}
                        y={(props.cy || 0) - (i * 14)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="16"
                      >
                        ⭐
                      </text>
                    ))}
                    {/* Si plus de 3 victoires, ajouter un indicateur */}
                    {count > 3 && (
                      <text
                        x={props.cx}
                        y={(props.cy || 0) - (3 * 14)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fill="#F59E0B"
                        fontWeight="bold"
                      >
                        +{count - 3}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <span>Aucun</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-200" />
          <span>1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-400" />
          <span>2-3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-600" />
          <span>4+</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>Aujourd&apos;hui</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">⭐</span>
          <span>Victoire (empilées si plusieurs)</span>
        </div>
      </div>
    </div>
  );
});

