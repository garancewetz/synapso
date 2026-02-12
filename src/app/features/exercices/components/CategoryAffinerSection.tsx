'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { ExerciceCategory } from '@/app/types/exercice';
import { FilterBadge } from '@/app/components/ui';
import { ChevronIcon } from '@/app/components/ui/icons';

type BodypartWithCount = { value: string; label: string; icon: string; count: number };
type EquipmentWithCount = { value: string; label: string; icon: string; count: number };

type Props = {
  categoryParam: ExerciceCategory;
  bodypartsWithCounts: BodypartWithCount[];
  equipmentsWithCounts: EquipmentWithCount[];
  selectedBodyparts: string[];
  setSelectedBodyparts: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEquipments: string[];
  setSelectedEquipments: React.Dispatch<React.SetStateAction<string[]>>;
  isAllBodypartsSelected: boolean;
  isAllEquipmentsSelected: boolean;
  onSelectAllBodyparts: () => void;
  onSelectAllEquipments: () => void;
};

export function CategoryAffinerSection({
  categoryParam,
  bodypartsWithCounts,
  equipmentsWithCounts,
  selectedBodyparts,
  setSelectedBodyparts,
  selectedEquipments,
  setSelectedEquipments,
  isAllBodypartsSelected,
  isAllEquipmentsSelected,
  onSelectAllBodyparts,
  onSelectAllEquipments,
}: Props) {
  const [affinerOpen, setAffinerOpen] = useState(false);

  if (bodypartsWithCounts.length === 0 && equipmentsWithCounts.length === 0) {
    return null;
  }

  const activeFiltersCount = selectedBodyparts.length + selectedEquipments.length;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80">
      <button
        type="button"
        onClick={() => setAffinerOpen(prev => !prev)}
        className={clsx(
          'w-full flex items-center justify-between gap-3 min-h-[44px] py-3 px-4',
          'text-sm font-medium text-gray-800',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 focus-visible:ring-inset rounded-lg',
          'active:bg-gray-100/80 transition-colors duration-200'
        )}
        aria-expanded={affinerOpen}
        aria-controls="affiner-filters"
        aria-label={
          affinerOpen
            ? 'Masquer les filtres par zone et équipement'
            : 'Afficher les filtres par zone et équipement'
        }
      >
        <span className="flex items-center gap-2">
          Affiner la liste
          {activeFiltersCount > 0 && (
            <span
              className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-300 text-gray-700 text-xs font-semibold"
              aria-hidden
            >
              {activeFiltersCount}
            </span>
          )}
        </span>
        <ChevronIcon
          direction={affinerOpen ? 'up' : 'down'}
          className={clsx(
            'w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ease-out',
            affinerOpen && 'text-gray-700'
          )}
          aria-hidden
        />
      </button>
      <div
        id="affiner-filters"
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-out',
          affinerOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!affinerOpen}
      >
        <div className="pt-1 pb-4 px-4 space-y-4">
          {bodypartsWithCounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Partie du corps
              </label>
              <div className="flex flex-wrap gap-2">
                <FilterBadge
                  label="Tous"
                  isActive={isAllBodypartsSelected}
                  category={categoryParam}
                  onClick={onSelectAllBodyparts}
                />
                {bodypartsWithCounts.map(({ value, label, icon, count }) => {
                  const isSelected = selectedBodyparts.includes(value);
                  return (
                    <FilterBadge
                      key={value}
                      label={label}
                      icon={icon}
                      count={count}
                      isActive={isSelected}
                      category={categoryParam}
                      onClick={() => {
                        setSelectedBodyparts(prev =>
                          isSelected
                            ? prev.filter(bp => bp !== value)
                            : [...prev, value]
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {equipmentsWithCounts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
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
                        setSelectedEquipments(prev =>
                          isSelected
                            ? prev.filter(eq => eq !== value)
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
