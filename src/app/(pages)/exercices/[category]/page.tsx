'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  ExerciceCard,
  useExercices,
  useExerciceStatusFilter,
  useExerciceHandlers,
  useCategoryFilters,
  CategoryAffinerSection,
  CategoryActiveFiltersBar,
} from '@/app/features/exercices';
import { EmptyState } from '@/app/components/EmptyState';
import { StatusFilterSection } from '@/app/components/ui';
import type { ExerciceCategory, ExerciceStatusFilter, Exercice } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';

const HIGHLIGHT_RING_BY_CATEGORY: Record<ExerciceCategory, string> = {
  UPPER_BODY: 'ring-2 ring-orange-500',
  CORE: 'ring-2 ring-teal-500',
  LOWER_BODY: 'ring-2 ring-blue-500',
  STRETCHING: 'ring-2 ring-purple-500',
  FACE: 'ring-2 ring-amber-500',
};
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { AddButton } from '@/app/components/ui/AddButton';

function getHighlightedExerciceIdFromHash(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith('#exercice-')) return null;
  return hash.slice('#exercice-'.length);
}

export default function CategoryPage() {
  const [filter, setFilter] = useState<ExerciceStatusFilter>('all');
  const router = useRouter();
  const params = useParams();

  const categoryParam = useMemo(() => {
    return (params.category as string)?.toUpperCase() as ExerciceCategory;
  }, [params.category]);

  const isValidCategory = useMemo(() => CATEGORY_ORDER.includes(categoryParam), [categoryParam]);

  const { exercices, loading: loadingExercices, error: exercicesError, refetch: refetchExercices, updateExercice } = useExercices({
    category: params.category && isValidCategory ? categoryParam : undefined,
  });

  const { exercices: stretchingExercices, updateExercice: updateStretchingExercice } = useExercices({
    category:
      params.category && categoryParam !== 'STRETCHING' ? 'STRETCHING' : undefined,
  });

  useEffect(() => {
    if (params.category && !isValidCategory) {
      router.push('/');
    }
  }, [params.category, isValidCategory, router]);

  const { filteredExercices: baseFilteredExercices, completedCount } = useExerciceStatusFilter({
    exercices,
    filter,
  });

  const filters = useCategoryFilters({
    exercices,
    stretchingExercices,
    baseFilteredExercices,
    categoryParam,
    filter,
  });

  const handleCompleted = useCallback(
    (updatedExercice: Exercice) => {
      updateExercice(updatedExercice);
      if (updatedExercice.category === 'STRETCHING') {
        updateStretchingExercice(updatedExercice);
      }
    },
    [updateExercice, updateStretchingExercice]
  );

  const { handleEditClick } = useExerciceHandlers({ updateExercice });

  const onRemoveStatusFilter = useCallback(() => setFilter('all'), []);
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
  }, [filters.handleResetAllFilters]);

  const handleArchive = useCallback(
    (updatedExercice: Exercice) => {
      updateExercice(updatedExercice);
    },
    [updateExercice]
  );

  const hasScrolledToHashRef = useRef(false);
  const [highlightedExerciceId, setHighlightedExerciceId] = useState<string | null>(null);

  useEffect(() => {
    const id = getHighlightedExerciceIdFromHash();
    if (!id) return;
    setHighlightedExerciceId(id);
    const timeout = setTimeout(() => setHighlightedExerciceId(null), 4000);
    return () => clearTimeout(timeout);
  }, [loadingExercices]);

  useEffect(() => {
    if (loadingExercices || hasScrolledToHashRef.current) return;
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash.startsWith('#exercice-')) return;
    const id = hash.slice('#exercice-'.length);
    const el = document.getElementById(`exercice-${id}`);
    if (el) {
      hasScrolledToHashRef.current = true;
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
      return () => clearTimeout(t);
    }
  }, [loadingExercices]);

  if (params.category && !isValidCategory) {
    return null;
  }

  if (!params.category) {
    return (
      <section className="pb-12 md:pb-8">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-2 md:pt-4 px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Chargement...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-12 md:pb-8" aria-live="polite" aria-busy={loadingExercices}>
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-2 md:pt-4 px-4 md:px-6 lg:px-8">
        {exercicesError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Impossible de charger les exercices.</span>
            <button
              type="button"
              onClick={() => refetchExercices()}
              className="font-medium text-red-800 underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded"
            >
              Réessayer
            </button>
          </div>
        )}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {CATEGORY_LABELS[categoryParam]}
              </h1>
              {loadingExercices ? (
                <p className="text-gray-500 mt-1">
                  <span className="inline-block h-5 w-40 bg-gray-200 rounded animate-pulse" />
                </p>
              ) : exercices.length > 0 ? (
                <p className="text-gray-500 mt-1">
                  {completedCount}/{exercices.length}{' '}
                  {categoryParam === 'STRETCHING' ? 'étirements' : 'exercices'} complétés
                  {filters.totalStretchingCount > 0 && categoryParam !== 'STRETCHING' && (
                    <span className="text-gray-400">
                      {' '}
                      et {filters.totalStretchingCount} étirement
                      {filters.totalStretchingCount > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              ) : null}
            </div>
            <AddButton
              href="/exercice/add"
              queryParams={{ category: categoryParam.toLowerCase() }}
              addFromParam
              className="shrink-0"
            />
          </div>

          <div className="mt-4 space-y-4">
            <StatusFilterSection filter={filter} onFilterChange={setFilter} />
            <CategoryAffinerSection
              categoryParam={categoryParam}
              bodypartsWithCounts={filters.bodypartsWithCounts}
              equipmentsWithCounts={filters.equipmentsWithCounts}
              selectedBodyparts={filters.selectedBodyparts}
              setSelectedBodyparts={filters.setSelectedBodyparts}
              selectedEquipments={filters.selectedEquipments}
              setSelectedEquipments={filters.setSelectedEquipments}
              isAllBodypartsSelected={filters.isAllBodypartsSelected}
              isAllEquipmentsSelected={filters.isAllEquipmentsSelected}
              onSelectAllBodyparts={filters.handleSelectAllBodyparts}
              onSelectAllEquipments={filters.handleSelectAllEquipments}
            />
          </div>
        </div>
      </div>

      <CategoryActiveFiltersBar
        categoryParam={categoryParam}
        filter={filter}
        selectedBodyparts={filters.selectedBodyparts}
        selectedEquipments={filters.selectedEquipments}
        onRemoveStatusFilter={onRemoveStatusFilter}
        onRemoveBodypart={onRemoveBodypart}
        onRemoveEquipment={onRemoveEquipment}
        onResetAll={onResetAll}
      />

      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {loadingExercices ? (
            <div className="flex items-center justify-center min-h-screen py-12">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : filters.filteredExercices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <EmptyState
                icon={NAVIGATION_EMOJIS.FOLDER_OPEN}
                title={
                  filter === 'notCompleted'
                    ? 'Tous les exercices sont faits !'
                    : filter === 'completed'
                      ? 'Aucun exercice fait'
                      : `Aucun exercice ${CATEGORY_LABELS[categoryParam].toLowerCase()}`
                }
                message={
                  filter === 'notCompleted'
                    ? 'Félicitations, vous avez complété tous les exercices de cette catégorie.'
                    : filter === 'completed'
                      ? "Vous n'avez pas encore complété d'exercices dans cette catégorie."
                      : 'Cette catégorie est vide pour le moment.'
                }
                subMessage={
                  filter === 'all' ? 'Ajoutez des exercices depuis le menu.' : undefined
                }
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="grid gap-3 grid-cols-1 lg:grid-cols-2"
            >
              {filters.filteredExercices.map((exercice) => (
                <div
                  key={exercice.id}
                  id={`exercice-${exercice.id}`}
                  className={clsx(
                    'h-full scroll-mt-24 transition-shadow duration-300 rounded-xl',
                    highlightedExerciceId === String(exercice.id) &&
                      `${HIGHLIGHT_RING_BY_CATEGORY[exercice.category]} ring-offset-2 ring-offset-background shadow-lg`
                  )}
                >
                  <ExerciceCard
                    exercice={exercice}
                    onEdit={handleEditClick}
                    onCompleted={handleCompleted}
                    onArchive={handleArchive}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {filters.relatedStretchingExercices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="mt-8"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Étirements pour {CATEGORY_LABELS[categoryParam].toLowerCase()}
                </h2>
                <p className="text-sm text-gray-500">
                  Exercices d&apos;étirement qui ciblent les mêmes zones
                </p>
              </div>
              <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                {filters.relatedStretchingExercices.map((exercice) => (
                  <div
                    key={exercice.id}
                    id={`exercice-${exercice.id}`}
                    className={clsx(
                      'h-full scroll-mt-24 transition-shadow duration-300 rounded-xl',
                      highlightedExerciceId === String(exercice.id) &&
                        `${HIGHLIGHT_RING_BY_CATEGORY[exercice.category]} ring-offset-2 ring-offset-background shadow-lg`
                    )}
                  >
                    <ExerciceCard
                      exercice={exercice}
                      onEdit={handleEditClick}
                      onCompleted={handleCompleted}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
      </div>

      <div className="flex justify-center mt-8 mb-6">
        <AddButton
          href="/exercice/add"
          label="Ajouter un exercice"
          queryParams={{ category: categoryParam.toLowerCase() }}
          addFromParam
        />
      </div>
    </section>
  );
}
