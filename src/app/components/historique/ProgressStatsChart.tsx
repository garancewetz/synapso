'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO, startOfWeek, eachWeekOfInterval, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isOrthophonieProgress } from '@/app/utils/progress.utils';
import { CATEGORY_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { useUser } from '@/app/contexts/UserContext';
import type { Progress } from '@/app/types';

type Props = {
  progressList: Progress[];
  hideTitle?: boolean;
};

type ChartDataPoint = {
  week: string;
  weekKey: string;
  ortho: number;
  physique: number;
  total: number;
};

// Constantes pour les couleurs du graphique
const COLORS = {
  ORTHO: '#FBBF24',
  ORTHO_GRADIENT: '#EAB308',
  PHYSIQUE: '#F97316',
} as const;

// Helper: Obtenir la fin d'une semaine
function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

// Helper: Calculer les progrès cumulatifs jusqu'à une date
function getCumulativeProgress(progressList: Progress[], untilDate: Date): Progress[] {
  return progressList.filter(p => parseISO(p.createdAt) <= untilDate);
}

// Helper: Compter les progrès par type
function countProgressByType(progressList: Progress[]) {
  const ortho = progressList.filter(p => isOrthophonieProgress(p.emoji)).length;
  const physique = progressList.length - ortho;
  return { ortho, physique };
}

/**
 * Graphique de cumul avec aires empilées
 * Montre la progression cumulative des progrès - la montagne ne fait que grandir !
 */
export function ProgressStatsChart({ progressList, hideTitle = false }: Props) {
  const { effectiveUser } = useUser();
  
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (progressList.length === 0) return [];

    // Trier les progrès par date
    const sortedProgress = [...progressList].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Définir la plage de semaines : 1 semaine avant le premier progrès → semaine actuelle
    const firstProgressDate = parseISO(sortedProgress[0].createdAt);
    const firstProgressWeek = startOfWeek(firstProgressDate, { weekStartsOn: 1 });
    const startDate = addWeeks(firstProgressWeek, -1);
    const todayWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weeks = eachWeekOfInterval(
      { start: startDate, end: todayWeek },
      { weekStartsOn: 1 }
    );

    // Créer un point de données pour chaque semaine
    return weeks.map((weekStart): ChartDataPoint => {
      const weekEnd = getWeekEnd(weekStart);
      const cumulativeProgress = getCumulativeProgress(sortedProgress, weekEnd);
      const { ortho, physique } = countProgressByType(cumulativeProgress);

      return {
        week: format(weekStart, 'd MMM', { locale: fr }),
        weekKey: format(weekStart, 'yyyy-MM-dd'),
        ortho,
        physique,
        total: ortho + physique,
      };
    });
  }, [progressList]);

  // Calculer le maximum pour l'axe Y (+1 pour montrer qu'on peut encore progresser)
  const maxYValue = useMemo(() => progressList.length + 1, [progressList.length]);

  // État vide
  if (progressList.length === 0) {
    return (
      <EmptyState hideTitle={hideTitle} />
    );
  }

  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 w-full">
      {!hideTitle && <ChartTitle />}
      
      <div className="w-full h-64 sm:h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <ChartGradients />
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval={Math.max(0, Math.floor(chartData.length / 6))}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              allowDecimals={false}
              domain={[0, maxYValue]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '8px 12px',
              }}
              formatter={formatTooltip}
            />
            {effectiveUser?.isAphasic && (
              <Area 
                type="monotone" 
                dataKey="ortho" 
                stackId="1"
                stroke={COLORS.ORTHO} 
                fill="url(#colorOrtho)"
                strokeWidth={2.5}
              />
            )}
            <Area 
              type="monotone" 
              dataKey="physique" 
              stackId="1"
              stroke={COLORS.PHYSIQUE} 
              fill="url(#colorPhysique)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <ChartLegend isAphasic={effectiveUser?.isAphasic ?? false} />
    </div>
  );
}

// Composant: État vide
function EmptyState({ hideTitle }: { hideTitle: boolean }) {
  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      {!hideTitle && <ChartTitle />}
      <div className="text-center py-8">
        <span className="text-3xl mb-2 block">🌟</span>
        <p className="text-gray-500">Tes progrès apparaîtront ici !</p>
      </div>
    </div>
  );
}

// Composant: Titre du graphique
function ChartTitle() {
  return (
    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span>{PROGRESS_EMOJIS.TROPHY}</span>
      <span>Mes progrès</span>
    </h2>
  );
}

// Composant: Gradients du graphique
function ChartGradients() {
  return (
    <defs>
      <linearGradient id="colorOrtho" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLORS.ORTHO} stopOpacity={0.9}/>
        <stop offset="50%" stopColor={COLORS.ORTHO_GRADIENT} stopOpacity={0.7}/>
        <stop offset="95%" stopColor={COLORS.ORTHO_GRADIENT} stopOpacity={0.15}/>
      </linearGradient>
      <linearGradient id="colorPhysique" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.9}/>
        <stop offset="50%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.7}/>
        <stop offset="95%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.15}/>
      </linearGradient>
    </defs>
  );
}

// Composant: Légende du graphique
function ChartLegend({ isAphasic }: { isAphasic: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-4">
      {isAphasic && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-gray-700 font-medium">{CATEGORY_EMOJIS.ORTHOPHONIE} Orthophonie</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-orange-500" />
        <span className="text-gray-700 font-medium">{CATEGORY_EMOJIS.PHYSIQUE} Physique</span>
      </div>
    </div>
  );
}

// Formatter pour le tooltip
function formatTooltip(value: number | undefined, name: string | undefined) {
  if (value === undefined || name === undefined) return ['', ''];
  const label = name === 'ortho' ? 'Orthophonie' : name === 'physique' ? 'Physique' : 'Total';
  return [`${value} progrès`, label];
}

