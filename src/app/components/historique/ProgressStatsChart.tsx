'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO, startOfWeek, eachWeekOfInterval, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isOrthophonieProgress, getExerciceCategoryFromEmoji } from '@/app/utils/progress.utils';
import { CATEGORY_EMOJIS, PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { PROGRESS_TAGS } from '@/app/constants/progress.constants';
import { PROGRESS_DISPLAY_COLORS, ORTHOPHONIE_COLORS } from '@/app/constants/progress.constants';
import { CATEGORY_LABELS_SHORT, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import type { Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { Card } from '@/app/components/ui/Card';
import clsx from 'clsx';

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
    <Card variant="default" padding="md" className="mb-6 w-full">
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
      
      <ProgressBadges progressList={progressList} />
    </Card>
  );
}

// Composant: État vide
function EmptyState({ hideTitle }: { hideTitle: boolean }) {
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

// Composant: Badges de progression par tags et catégories
function ProgressBadges({ progressList }: { progressList: Progress[] }) {
  // Calculer les stats par tags
  const statsByTags = useMemo(() => {
    const counts: Record<string, number> = {};
    
    PROGRESS_TAGS.forEach(({ label }) => {
      counts[label] = 0;
    });

    progressList.forEach((progress) => {
      if (progress.tags && Array.isArray(progress.tags)) {
        progress.tags.forEach((tag) => {
          if (tag in counts) {
            counts[tag]++;
          }
        });
      }
    });

    return PROGRESS_TAGS.map(({ label, emoji }) => ({
      label,
      emoji,
      count: counts[label] || 0,
    })).filter((stat) => stat.count > 0);
  }, [progressList]);

  // Calculer les stats par catégories
  const statsByCategories = useMemo(() => {
    const counts: Record<string, number> = {
      UPPER_BODY: 0,
      CORE: 0,
      LOWER_BODY: 0,
      STRETCHING: 0,
      ORTHOPHONIE: 0,
    };

    progressList.forEach((progress) => {
      if (isOrthophonieProgress(progress.emoji)) {
        counts.ORTHOPHONIE++;
      } else {
        const category = getExerciceCategoryFromEmoji(progress.emoji);
        if (category && category in counts) {
          counts[category]++;
        }
      }
    });

    const categoryStats = [
      {
        key: 'UPPER_BODY' as const,
        label: CATEGORY_LABELS_SHORT.UPPER_BODY,
        emoji: CATEGORY_ICONS.UPPER_BODY,
        count: counts.UPPER_BODY,
      },
      {
        key: 'CORE' as const,
        label: CATEGORY_LABELS_SHORT.CORE,
        emoji: CATEGORY_ICONS.CORE,
        count: counts.CORE,
      },
      {
        key: 'LOWER_BODY' as const,
        label: CATEGORY_LABELS_SHORT.LOWER_BODY,
        emoji: CATEGORY_ICONS.LOWER_BODY,
        count: counts.LOWER_BODY,
      },
      {
        key: 'STRETCHING' as const,
        label: CATEGORY_LABELS_SHORT.STRETCHING,
        emoji: CATEGORY_ICONS.STRETCHING,
        count: counts.STRETCHING,
      },
      {
        key: 'ORTHOPHONIE' as const,
        label: 'Orthophonie',
        emoji: CATEGORY_EMOJIS.ORTHOPHONIE,
        count: counts.ORTHOPHONIE,
      },
    ].filter((stat) => stat.count > 0);

    return categoryStats;
  }, [progressList]);

  // Combiner tous les badges
  const allBadges = useMemo(() => {
    const badges: Array<{
      key: string;
      label: string;
      emoji: string;
      count: number;
      className: string;
    }> = [];

    // Ajouter les tags
    statsByTags.forEach(({ label, emoji, count }) => {
      badges.push({
        key: `tag-${label}`,
        label,
        emoji,
        count,
        className: clsx(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg border',
          'bg-gray-50 border-gray-200 text-gray-700',
          'font-semibold text-sm'
        ),
      });
    });

    // Ajouter les catégories
    statsByCategories.forEach(({ key, label, emoji, count }) => {
      const isOrtho = key === 'ORTHOPHONIE';
      const colors = isOrtho
        ? {
            bg: ORTHOPHONIE_COLORS.inactive,
            border: 'border-yellow-200',
            text: 'text-yellow-700',
          }
        : PROGRESS_DISPLAY_COLORS[key as ExerciceCategory];

      badges.push({
        key: `category-${key}`,
        label,
        emoji,
        count,
        className: clsx(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg border',
          'font-semibold text-sm',
          colors.bg,
          colors.border,
          colors.text
        ),
      });
    });

    return badges;
  }, [statsByTags, statsByCategories]);

  // Ne rien afficher si pas de badges
  if (allBadges.length === 0) {
    return null;
  }

  return (
    <>
      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />
      
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {allBadges.map(({ key, label, emoji, count, className }) => {
          const isTag = key.startsWith('tag-');
          const countColor = isTag ? 'text-gray-600' : 'opacity-80';

          return (
            <div key={key} className={className}>
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
              <span className={countColor}>+{count}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

