'use client';

import { BaseFilterBadge } from './BaseFilterBadge';
import type { ExerciceStatusFilter } from '@/app/types/exercice';

type Props = {
  value: ExerciceStatusFilter;
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
};

/**
 * Badge de filtre pour l'état des exercices (Tous / Non faits / Faits)
 * Utilise un ring vert pour "Faits" (sémantique du succès) et gris pour les autres
 */
export function StatusFilterBadge({
  value,
  label,
  count,
  isActive,
  onClick,
  ariaLabel,
}: Props) {
  // Ring vert pour "Faits" (sémantique du succès), gris pour les autres
  const isCompletedFilter = value === 'completed';

  return (
    <BaseFilterBadge
      label={label}
      count={count}
      isActive={isActive}
      onClick={onClick}
      ariaLabel={ariaLabel}
      colors={{
        activeBg: isCompletedFilter ? 'bg-emerald-500' : 'bg-gray-800',
        activeRing: isCompletedFilter ? 'ring-emerald-300' : 'ring-gray-400',
        inactiveBg: 'bg-white',
        inactiveText: 'text-gray-700',
        inactiveBorder: 'border-gray-200',
        inactiveTag: 'bg-gray-100 text-gray-600',
        focusRing: isCompletedFilter ? 'focus:ring-emerald-500' : 'focus:ring-gray-400',
      }}
    />
  );
}

