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
  showCloseIcon?: boolean;
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
  showCloseIcon = false,
}: Props) {
  const categoryColors = CATEGORY_COLORS[category];
  const isAllLabel = label === 'Toutes';

  // Couleurs anthracites pour le badge "Toutes"
  const anthraciteColors = {
    activeBg: 'bg-gray-900',
    activeRing: 'ring-gray-300',
    inactiveBg: 'bg-gray-100',
    inactiveText: 'text-gray-800',
    inactiveBorder: 'border-gray-300',
    inactiveTag: 'bg-gray-200 text-gray-700',
    focusRing: 'focus:ring-gray-400',
  };

  return (
    <BaseFilterBadge
      label={label}
      icon={icon}
      count={count}
      isActive={isActive}
      onClick={onClick}
      ariaLabel={ariaLabel}
      showCloseIcon={showCloseIcon}
      colors={
        isAllLabel
          ? anthraciteColors
          : {
              activeBg: categoryColors.accent,
              activeRing: categoryColors.focusRing.replace('focus:', ''),
              inactiveBg: categoryColors.bg,
              inactiveText: categoryColors.text,
              inactiveBorder: categoryColors.border,
              inactiveTag: categoryColors.tag,
              focusRing: categoryColors.focusRing,
            }
      }
    />
  );
}

