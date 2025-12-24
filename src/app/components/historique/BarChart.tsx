'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { HeatmapDay } from '@/app/utils/historique.utils';

interface BarChartProps {
  data: HeatmapDay[];
  currentStreak: number;
}

function getBarColor(count: number, isToday: boolean): string {
  if (isToday) return '#3B82F6';
  if (count === 0) return '#F3F4F6';
  if (count === 1) return '#6EE7B7';
  if (count <= 3) return '#34D399';
  return '#10B981';
}

export function BarChart({ data, currentStreak }: BarChartProps) {
  // Filtrer les jours vides et formater pour le graphique
  const chartData = data
    .filter(day => !day.isEmpty)
    .map(day => ({
      date: day.date,
      dateKey: day.dateKey,
      count: day.count || 0,
      isToday: day.isToday,
      label: day.date ? format(day.date, 'd MMM', { locale: fr }) : '',
      dayLabel: day.date ? format(day.date, 'EEE', { locale: fr }) : '',
    }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📅 Ta régularité (30 jours)
        {currentStreak >= 3 && (
          <span className="text-sm font-normal text-amber-500 ml-2">
            🔥 {currentStreak}j
          </span>
        )}
      </h2>
      
      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval={Math.floor(chartData.length / 7)}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              allowDecimals={false}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.count, entry.isToday)}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <span>Aucun</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-200" />
          <span>1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-400" />
          <span>2-3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600" />
          <span>4+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>Aujourd&apos;hui</span>
        </div>
      </div>
    </div>
  );
}

