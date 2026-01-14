'use client';

import { useMemo } from 'react';
import type { Progress } from '@/app/types';
import { PROGRESS_TAGS, PROGRESS_DISPLAY_COLORS, ORTHOPHONIE_COLORS } from '@/app/constants/progress.constants';
import { CATEGORY_LABELS_SHORT, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress } from '@/app/utils/progress.utils';
import type { ExerciceCategory } from '@/app/types/exercice';
import { Card } from '@/app/components/ui/Card';
import clsx from 'clsx';

type Props = {
  progressList: Progress[];
};

/**
 * Composant affichant les statistiques de progression par tags et catégories
 * Affiche de manière encourageante le nombre de progrès par tag (Force, Souplesse, etc.)
 * et par catégorie (Haut du corps, Bas du corps, etc.)
 */
export function ProgressStatsByTags({ progressList }: Props) {
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

  // Combiner tous les badges en une seule liste
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

  // Ne rien afficher si pas de stats
  if (allBadges.length === 0) {
    return null;
  }

  return (
    <Card variant="default" padding="md" className="mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Mes progressions</span>
      </h3>

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
    </Card>
  );
}

