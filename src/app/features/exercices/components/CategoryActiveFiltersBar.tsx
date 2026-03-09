'use client';

import { EXERCICE_STATUS_FILTER_OPTIONS } from '@/app/constants/exercice.constants';
import type { ExerciceCategory, ExerciceStatusFilter } from '@/app/types/exercice';
import { FilterBadge } from '@/app/components/ui';

type Props = {
  categoryParam: ExerciceCategory;
  filter: ExerciceStatusFilter;
  selectedBodyparts: string[];
  selectedEquipments: string[];
  onRemoveStatusFilter: () => void;
  onRemoveBodypart: (value: string) => void;
  onRemoveEquipment: (value: string) => void;
  onResetAll: () => void;
};

/**
 * Barre sticky rappelant les filtres actifs sur la page catégorie.
 * Reste visible au scroll pour que l'utilisateur comprenne pourquoi la liste est filtrée.
 */
export function CategoryActiveFiltersBar({
  categoryParam,
  filter,
  selectedBodyparts,
  selectedEquipments,
  onRemoveStatusFilter,
  onRemoveBodypart,
  onRemoveEquipment,
  onResetAll,
}: Props) {
  const hasStatusFilter = filter !== 'all';
  const hasBodypartFilter = selectedBodyparts.length > 0;
  const hasEquipmentFilter = selectedEquipments.length > 0;
  const hasAnyFilter = hasStatusFilter || hasBodypartFilter || hasEquipmentFilter;

  if (!hasAnyFilter) {
    return null;
  }

  const statusLabel =
    EXERCICE_STATUS_FILTER_OPTIONS.find((opt) => opt.value === filter)?.label ?? '';

  return (
    <div
      className="sticky top-0 z-10 w-full bg-gray-100 border-b border-gray-200"
      role="status"
      aria-live="polite"
      aria-label="Filtres actifs. Cliquez sur une croix pour retirer un filtre."
    >
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-800 shrink-0">Filtres :</span>
        {hasStatusFilter && (
          <FilterBadge
            label={statusLabel}
            isActive
            category={categoryParam}
            onClick={onRemoveStatusFilter}
            ariaLabel={`Retirer le filtre ${statusLabel}`}
            showCloseIcon
          />
        )}
        {selectedBodyparts.map((value) => (
          <FilterBadge
            key={value}
            label={value}
            isActive
            category={categoryParam}
            onClick={() => onRemoveBodypart(value)}
            ariaLabel={`Retirer le filtre ${value}`}
            showCloseIcon
          />
        ))}
        {selectedEquipments.map((value) => (
          <FilterBadge
            key={value}
            label={value}
            isActive
            category={categoryParam}
            variant="white"
            onClick={() => onRemoveEquipment(value)}
            ariaLabel={`Retirer le filtre ${value}`}
            showCloseIcon
          />
        ))}
        <button
          type="button"
          onClick={onResetAll}
          className="shrink-0 min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 focus-visible:ring-offset-gray-100"
          aria-label="Effacer tous les filtres et afficher tous les exercices"
        >
          Tout effacer
        </button>
      </div>
    </div>
  );
}
