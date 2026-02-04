'use client';

import type { ReactNode } from 'react';
import { BaseFilterBadge } from './BaseFilterBadge';

type Props = {
  label: string;
  icon?: string | ReactNode;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
  showCloseIcon?: boolean;
};

/**
 * Badge de filtre pour les équipements
 * Utilise le même style que FilterBadge mais avec des couleurs neutres (gris)
 */
export function EquipmentFilterBadge({
  label,
  icon,
  count,
  isActive,
  onClick,
  ariaLabel,
  showCloseIcon = false,
}: Props) {
  const isAllLabel = label === 'Tous';

  // Couleurs anthracites pour le badge "Tous"
  const anthraciteColors = {
    activeBg: 'bg-gray-900',
    activeRing: 'ring-gray-300',
    inactiveBg: 'bg-gray-100',
    inactiveText: 'text-gray-800',
    inactiveBorder: 'border-gray-300',
    inactiveTag: 'bg-gray-200 text-gray-700',
    focusRing: 'focus:ring-gray-400',
  };

  // Couleurs standard pour les autres badges équipements
  const standardColors = {
    activeBg: 'bg-gray-800',
    activeRing: 'ring-gray-300',
    inactiveBg: 'bg-white',
    inactiveText: 'text-gray-700',
    inactiveBorder: 'border-gray-200',
    inactiveTag: 'bg-gray-100 text-gray-600',
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
      colors={isAllLabel ? anthraciteColors : standardColors}
    />
  );
}

