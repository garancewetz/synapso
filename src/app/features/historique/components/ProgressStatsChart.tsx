'use client';

import { memo, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO, startOfWeek, eachWeekOfInterval, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getDateKey } from '@/app/utils/date.utils';
import { CATEGORY_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { CATEGORY_CHART_COLORS } from '@/app/constants/exercice.constants';
import { useTimeContext } from '@/app/contexts/TimeContext';
import type { Progress } from '@/app/types';
import { Card } from '@/app/components/ui/Card';

type Props = {
  progressList: Progress[];
  hideTitle?: boolean;
};

type ChartDataPoint = {
  week: string;
  weekKey: string;
  physique: number;
  total: number;
};

// Constantes pour les couleurs du graphique (utilise les constantes du projet)
const COLORS = {
  PHYSIQUE: CATEGORY_CHART_COLORS.UPPER_BODY, // Orange pour les progrès physiques
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

// Helper: Compter les progrès physiques
function countPhysiqueProgress(progressList: Progress[]) {
  return progressList.length;
}

/**
 * Graphique de cumul avec aires empilées
 * Montre la progression cumulative des progrès - la montagne ne fait que grandir !
 */
export const ProgressStatsChart = memo(function ProgressStatsChart({ progressList, hideTitle = false }: Props) {
  const { referenceDate } = useTimeContext();
  
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (progressList.length === 0) return [];

    // Trier les progrès par date
    const sortedProgress = [...progressList].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Définir la plage de semaines : 1 semaine avant le premier progrès → semaine de référence
    const firstProgressDate = parseISO(sortedProgress[0].createdAt);
    const firstProgressWeek = startOfWeek(firstProgressDate, { weekStartsOn: 1 });
    const startDate = addWeeks(firstProgressWeek, -1);
    const referenceWeek = startOfWeek(referenceDate, { weekStartsOn: 1 });
    
    const weeks = eachWeekOfInterval(
      { start: startDate, end: referenceWeek },
      { weekStartsOn: 1 }
    );

    // Créer un point de données pour chaque semaine
    return weeks.map((weekStart): ChartDataPoint => {
      const weekEnd = getWeekEnd(weekStart);
      const cumulativeProgress = getCumulativeProgress(sortedProgress, weekEnd);
      const physique = countPhysiqueProgress(cumulativeProgress);

      return {
        week: format(weekStart, 'd MMM', { locale: fr }),
        weekKey: getDateKey(weekStart) ?? '',
        physique,
        total: physique,
      };
    });
  }, [progressList, referenceDate]);

  // Calculer le maximum pour l'axe Y (+1 pour montrer qu'on peut encore progresser)
  const maxYValue = useMemo(() => progressList.length + 1, [progressList.length]);

  // État vide
  if (progressList.length === 0) {
    return (
      <EmptyState hideTitle={hideTitle} />
    );
  }

  return (
    <Card variant="default" padding="md" className="mb-6 w-full">
      {!hideTitle && <ChartTitle />}
      
      <div 
        className="w-full h-64 sm:h-80 mb-4"
        role="img"
        aria-label="Graphique d'évolution des progrès au fil du temps montrant la progression cumulative des progrès physiques par semaine"
      >
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

      <ChartLegend />
    </Card>
  );
});

// Composant: État vide
type EmptyStateProps = {
  hideTitle: boolean;
};

function EmptyState({ hideTitle }: EmptyStateProps) {
  return (
    <Card variant="default" padding="md" className="mb-6">
      {!hideTitle && <ChartTitle />}
      <div className="text-center py-8">
        <span className="text-3xl mb-2 block">🌟</span>
        <p className="text-gray-500">Tes progrès apparaîtront ici !</p>
      </div>
    </Card>
  );
}

// Composant: Titre du graphique
function ChartTitle() {
  return (
    <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span>{PROGRESS_EMOJIS.TROPHY}</span>
      <span>Mes progrès</span>
    </h2>
  );
}

// Composant: Gradients du graphique
function ChartGradients() {
  return (
    <defs>
      <linearGradient id="colorPhysique" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.9}/>
        <stop offset="50%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.7}/>
        <stop offset="95%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.15}/>
      </linearGradient>
    </defs>
  );
}

// Composant: Légende du graphique
function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-orange-500" />
        <span className="text-gray-700 font-medium">{PROGRESS_EMOJIS.TROPHY} Progrès cumulés</span>
      </div>
    </div>
  );
}

// Formatter pour le tooltip
function formatTooltip(value: number | undefined, name: string | undefined) {
  if (value === undefined || name === undefined) return ['', ''];
  return [`${value} progrès`, 'Physique'];
}


