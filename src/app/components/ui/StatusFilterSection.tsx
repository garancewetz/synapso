'use client';

import { StatusFilterBadge } from './StatusFilterBadge';
import { EXERCICE_STATUS_FILTER_OPTIONS } from '@/app/constants/exercice.constants';
import type { ExerciceStatusFilter } from '@/app/types/exercice';

type Props = {
  filter: ExerciceStatusFilter;
  onFilterChange: (filter: ExerciceStatusFilter) => void;
};

/**
 * Section de filtres d'état pour les exercices (Tous / Non faits / Faits)
 */
export function StatusFilterSection({ filter, onFilterChange }: Props) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        État
      </label>
      <div className="flex flex-wrap gap-2">
        {EXERCICE_STATUS_FILTER_OPTIONS.map((option) => (
          <StatusFilterBadge
            key={option.value}
            value={option.value}
            label={option.label}
            isActive={filter === option.value}
            onClick={() => onFilterChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

