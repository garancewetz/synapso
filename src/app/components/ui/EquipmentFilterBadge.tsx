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
}: Props) {
  return (
    <BaseFilterBadge
      label={label}
      icon={icon}
      count={count}
      isActive={isActive}
      onClick={onClick}
      ariaLabel={ariaLabel}
      colors={{
        activeBg: 'bg-gray-800',
        activeRing: 'ring-gray-300',
        inactiveBg: 'bg-white',
        inactiveText: 'text-gray-700',
        inactiveBorder: 'border-gray-200',
        inactiveTag: 'bg-gray-100 text-gray-600',
        focusRing: 'focus:ring-gray-400',
      }}
    />
  );
}

