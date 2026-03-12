'use client';

import type { ExerciceCategory } from '@/app/types/exercice';
import { FilterBadge } from '@/app/components/ui';

type BodypartWithCount = { value: string; label: string; icon: string; count: number };

type Props = {
  categoryParam: ExerciceCategory;
  bodypartsWithCounts: BodypartWithCount[];
  selectedBodyparts: string[];
  setSelectedBodyparts: React.Dispatch<React.SetStateAction<string[]>>;
  isAllBodypartsSelected: boolean;
  onSelectAllBodyparts: () => void;
};

/**
 * Filtres par partie du corps, toujours visibles sur la page catégorie.
 */
export function CategoryBodypartsSection({
  categoryParam,
  bodypartsWithCounts,
  selectedBodyparts,
  setSelectedBodyparts,
  isAllBodypartsSelected,
  onSelectAllBodyparts,
}: Props) {
  if (bodypartsWithCounts.length === 0) {
    return null;
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-800 mb-2">
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
                setSelectedBodyparts((prev) =>
                  isSelected ? prev.filter((bp) => bp !== value) : [...prev, value]
                );
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
