import type { ExerciceCategory } from '@/app/types/exercice';
import {
  BODYPART_TO_CATEGORY,
  CATEGORY_CHART_COLORS,
  BODYPART_ICONS,
} from '@/app/constants/exercice.constants';
import { MAX_BODYPARTS_IN_CHART } from '@/app/constants/historique.constants';
import type { DonutChartItem } from './historique.types';

export function getDonutDataBodyparts(
  byBodypart: Record<string, number>
): DonutChartItem[] {
  const getBodypartColor = (bodypartName: string, index: number): string => {
    const category = BODYPART_TO_CATEGORY[bodypartName];
    const baseColor = category ? CATEGORY_CHART_COLORS[category] : '#6B7280';
    const opacity = 1 - (index * 0.12);
    return baseColor + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  const sortedBodyparts = Object.entries(byBodypart)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_BODYPARTS_IN_CHART)
    .map(([name, count], index) => ({
      name,
      value: count,
      icon: BODYPART_ICONS[name] || '⚪',
      color: getBodypartColor(name, index),
    }));

  return sortedBodyparts;
}
