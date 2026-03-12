'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { ExerciceCategory, ExerciceStatusFilter } from '@/app/types/exercice';
import { FilterBadge } from '@/app/components/ui';
import { ChevronIcon } from '@/app/components/ui/icons';
import { StatusFilterSection } from '@/app/components/ui/StatusFilterSection';

type EquipmentWithCount = { value: string; label: string; icon: string; count: number };

type Props = {
  categoryParam: ExerciceCategory;
  filter: ExerciceStatusFilter;
  onFilterChange: (filter: ExerciceStatusFilter) => void;
  equipmentsWithCounts: EquipmentWithCount[];
  selectedEquipments: string[];
  setSelectedEquipments: React.Dispatch<React.SetStateAction<string[]>>;
  isAllEquipmentsSelected: boolean;
  onSelectAllEquipments: () => void;
};

/**
 * Section repliable "Filtrer" : état (Tous / Non faits / Faits) + équipement.
 */
export function CategoryAffinerSection({
  categoryParam,
  filter,
  onFilterChange,
  equipmentsWithCounts,
  selectedEquipments,
  setSelectedEquipments,
  isAllEquipmentsSelected,
  onSelectAllEquipments,
}: Props) {
  const [filtrerOpen, setFiltrerOpen] = useState(false);

  const activeFiltersCount = (filter !== 'all' ? 1 : 0) + selectedEquipments.length;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80">
      <button
        type="button"
        onClick={() => setFiltrerOpen((prev) => !prev)}
        className={clsx(
          'w-full flex items-center justify-between gap-3 min-h-[44px] py-3 px-4',
          'text-sm font-medium text-gray-800',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 focus-visible:ring-inset rounded-lg',
          'active:bg-gray-100/80 transition-colors duration-200'
        )}
        aria-expanded={filtrerOpen}
        aria-controls="filtrer-filters"
        aria-label={
          filtrerOpen
            ? 'Masquer les filtres par état et équipement'
            : 'Afficher les filtres par état et équipement'
        }
      >
        <span className="flex items-center gap-2">
          Filtrer
          {activeFiltersCount > 0 && (
            <span
              className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-400 text-gray-900 text-xs font-semibold"
              aria-hidden
            >
              {activeFiltersCount}
            </span>
          )}
        </span>
        <ChevronIcon
          direction={filtrerOpen ? 'up' : 'down'}
          className={clsx(
            'w-5 h-5 text-gray-700 shrink-0 transition-transform duration-300 ease-out',
            filtrerOpen && 'text-gray-900'
          )}
          aria-hidden
        />
      </button>
      <div
        id="filtrer-filters"
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-out',
          filtrerOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!filtrerOpen}
      >
        <div className="pt-1 pb-4 px-4 space-y-4">
          <StatusFilterSection filter={filter} onFilterChange={onFilterChange} />
          {equipmentsWithCounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-800 mb-2">
                Équipement
              </label>
              <div className="flex flex-wrap gap-2">
                <FilterBadge
                  label="Tous"
                  isActive={isAllEquipmentsSelected}
                  category={categoryParam}
                  onClick={onSelectAllEquipments}
                  variant="white"
                />
                {equipmentsWithCounts.map(({ value, label, icon, count }) => {
                  const isSelected = selectedEquipments.includes(value);
                  return (
                    <FilterBadge
                      key={value}
                      label={label}
                      icon={icon}
                      count={count}
                      isActive={isSelected}
                      category={categoryParam}
                      variant="white"
                      onClick={() => {
                        setSelectedEquipments((prev) =>
                          isSelected
                            ? prev.filter((eq) => eq !== value)
                            : [...prev, value]
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
