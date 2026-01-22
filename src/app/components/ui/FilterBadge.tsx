'use client';

import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { BaseFilterBadge } from './BaseFilterBadge';

type Props = {
  label: string;
  icon?: string;
  count?: number;
  isActive: boolean;
  category: ExerciceCategory;
  onClick: () => void;
  ariaLabel?: string;
};

/**
 * Badge de filtre pour les parties du corps
 * Utilise les couleurs de la catégorie pour la cohérence visuelle
 */
export function FilterBadge({
  label,
  icon,
  count,
  isActive,
  category,
  onClick,
  ariaLabel,
}: Props) {
  const categoryColors = CATEGORY_COLORS[category];

  return (
    <BaseFilterBadge
      label={label}
      icon={icon}
      count={count}
      isActive={isActive}
      onClick={onClick}
      ariaLabel={ariaLabel}
      colors={{
        activeBg: categoryColors.accent,
        activeRing: categoryColors.focusRing.replace('focus:', ''),
        inactiveBg: categoryColors.bg,
        inactiveText: categoryColors.text,
        inactiveBorder: categoryColors.border,
        inactiveTag: categoryColors.tag,
        focusRing: categoryColors.focusRing,
      }}
    />
  );
}

