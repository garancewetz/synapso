'use client';

import { useCallback } from 'react';
import type { ExerciceStatusFilter } from '@/app/types/exercice';

type UseCategoryFiltersReturn = {
  selectedBodyparts: string[];
  setSelectedBodyparts: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEquipments: string[];
  setSelectedEquipments: React.Dispatch<React.SetStateAction<string[]>>;
  handleResetAllFilters: () => void;
};

type UseCategoryActiveFiltersBarHandlersOptions = {
  setFilter: (filter: ExerciceStatusFilter) => void;
  filters: UseCategoryFiltersReturn;
};

type UseCategoryActiveFiltersBarHandlersReturn = {
  onRemoveStatusFilter: () => void;
  onRemoveBodypart: (value: string) => void;
  onRemoveEquipment: (value: string) => void;
  onResetAll: () => void;
};

export function useCategoryActiveFiltersBarHandlers({
  setFilter,
  filters,
}: UseCategoryActiveFiltersBarHandlersOptions): UseCategoryActiveFiltersBarHandlersReturn {
  const onRemoveStatusFilter = useCallback(() => setFilter('all'), [setFilter]);

  const onRemoveBodypart = useCallback(
    (value: string) =>
      filters.setSelectedBodyparts((prev) => prev.filter((bp) => bp !== value)),
    [filters.setSelectedBodyparts]
  );

  const onRemoveEquipment = useCallback(
    (value: string) =>
      filters.setSelectedEquipments((prev) => prev.filter((eq) => eq !== value)),
    [filters.setSelectedEquipments]
  );

  const onResetAll = useCallback(() => {
    setFilter('all');
    filters.handleResetAllFilters();
  }, [setFilter, filters.handleResetAllFilters]);

  return {
    onRemoveStatusFilter,
    onRemoveBodypart,
    onRemoveEquipment,
    onResetAll,
  };
}
