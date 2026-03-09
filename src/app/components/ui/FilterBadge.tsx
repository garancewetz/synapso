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
  /** Blanc pour les badges équipement, couleurs de catégorie sinon */
  variant?: 'category' | 'white';
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
  variant = 'category',
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
    inactiveTag: 'bg-gray-200 text-gray-800',
    focusRing: 'focus:ring-gray-400',
  };

  const whiteColors = {
    activeBg: 'bg-gray-900',
    activeRing: 'ring-gray-300',
    inactiveBg: 'bg-white',
    inactiveText: 'text-gray-800',
    inactiveBorder: 'border-gray-300',
    inactiveTag: 'bg-gray-200 text-gray-800',
    focusRing: 'focus:ring-gray-400',
  };

  const colors =
    variant === 'white'
      ? whiteColors
      : isAllLabel
        ? anthraciteColors
        : {
            activeBg: categoryColors.accent,
            activeRing: categoryColors.focusRing.replace('focus:', ''),
            inactiveBg: categoryColors.bg,
            inactiveText: categoryColors.text,
            inactiveBorder: categoryColors.border,
            inactiveTag: categoryColors.tag,
            focusRing: categoryColors.focusRing,
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
      colors={colors}
    />
  );
}

