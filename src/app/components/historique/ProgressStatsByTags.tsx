'use client';

import { useMemo } from 'react';
import type { Progress } from '@/app/types';
import { PROGRESS_TAGS } from '@/app/constants/progress.constants';
import { CATEGORY_LABELS_SHORT, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress } from '@/app/utils/progress.utils';
import { Card } from '@/app/components/ui/Card';
import { Accordion } from '@/app/components/ui/Accordion';
import { Badge } from '@/app/components/ui/Badge';

type Props = {
  progressList: Progress[];
};

/**
 * Composant affichant les statistiques de progression par tags et catégories
 * Design minimaliste : affichage simple et épuré pour éviter la surcharge cognitive
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

  // Ne rien afficher si pas de données
  if (statsByTags.length === 0 && statsByCategories.length === 0) {
    return null;
  }

  return (
    <Card variant="default" padding="md">
      <Accordion>
        <Accordion.Item value="progress-detail">
          <Accordion.Trigger className="py-2">
            <span className="text-sm font-medium text-gray-700">Détail des gains</span>
          </Accordion.Trigger>
          <Accordion.Content className="pt-3">
            <div className="space-y-4">
              {/* Catégories */}
              {statsByCategories.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Par zone</p>
                  <div className="flex flex-wrap gap-2">
                    {statsByCategories.map(({ label, emoji, count }) => (
                      <Badge
                        key={label}
                        icon={emoji}
                        className="text-xs"
                      >
                        {label} <span className="font-semibold ml-1">+{count}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags */}
              {statsByTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Par type</p>
                  <div className="flex flex-wrap gap-2">
                    {statsByTags.map(({ label, emoji, count }) => (
                      <Badge
                        key={label}
                        icon={emoji}
                        className="text-xs"
                      >
                        {label} <span className="font-semibold ml-1">+{count}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </Card>
  );
}

