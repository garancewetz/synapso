'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { BottomSheetModal } from '@/app/components/ui/BottomSheetModal';
import { Loader } from '@/app/components/ui/Loader';
import { Button } from '@/app/components/ui/Button';
import { CheckIcon } from '@/app/components/ui/icons';
import { useExercices } from '@/app/features/exercices/hooks/useExercices';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS_SHORT,
  CATEGORY_ORDER,
} from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { LinkedExercice } from '@/app/types/journal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  value: number[];
  onChange: (exercices: LinkedExercice[]) => void;
};

export function ExercicePickerModal({ isOpen, onClose, value, onChange }: Props) {
  const { exercices, loading } = useExercices();
  const [selected, setSelected] = useState<Set<number>>(new Set(value));
  const [activeCategory, setActiveCategory] = useState<ExerciceCategory>(CATEGORY_ORDER[0]);

  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(value));
      const firstWithExercices =
        CATEGORY_ORDER.find((cat) => exercices.some((ex) => ex.category === cat)) ??
        CATEGORY_ORDER[0];
      setActiveCategory(firstWithExercices);
    }
  }, [isOpen, value, exercices]);

  const toggleExercice = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setSelected(new Set()), []);

  const handleValidate = useCallback(() => {
    const selectedExercices: LinkedExercice[] = exercices
      .filter((ex) => selected.has(ex.id))
      .map((ex) => ({ id: ex.id, name: ex.name, category: ex.category }));
    onChange(selectedExercices);
    onClose();
  }, [selected, exercices, onChange, onClose]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof exercices> = {};
    for (const ex of exercices) {
      const cat = ex.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ex);
    }
    return groups;
  }, [exercices]);

  const currentExercices = grouped[activeCategory] ?? [];

  const selectedCount = selected.size;
  const categoriesWithExercices = CATEGORY_ORDER.filter((cat) => (grouped[cat]?.length ?? 0) > 0);

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} showFooterClose={false}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-900">
              Lier des exercices
            </h2>
            {selectedCount > 0 && (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <span>{selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-medium text-gray-600 hover:text-gray-800 underline underline-offset-1"
                >
                  Tout effacer
                </button>
              </span>
            )}
          </div>
        </header>

        {!loading && exercices.length > 0 && categoriesWithExercices.length > 0 && (
          <div
            className="shrink-0 border-b border-gray-100 px-2"
            role="tablist"
            aria-label="Catégories d’exercices"
          >
            <div className="flex">
              {categoriesWithExercices.map((category) => {
                const colors = CATEGORY_COLORS[category];
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`exercices-panel-${category}`}
                    id={`tab-${category}`}
                    onClick={() => setActiveCategory(category)}
                    className={clsx(
                      'flex-1 px-2 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400',
                      isActive
                        ? `${colors.bg} ${colors.text} ${colors.border}`
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    )}
                  >
                    {CATEGORY_LABELS_SHORT[category]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="small" />
          </div>
        ) : exercices.length === 0 ? (
          <p className="text-gray-500 text-center py-12 px-5">
            Aucun exercice disponible
          </p>
        ) : (
          <div
            id={`exercices-panel-${activeCategory}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeCategory}`}
            className="overflow-y-auto flex-1 min-h-0 px-4 py-3"
          >
            {currentExercices.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">
                Aucun exercice dans cette catégorie.
              </p>
            ) : (
              <ul className="space-y-1" role="list">
                {currentExercices.map((ex) => {
                  const colors = CATEGORY_COLORS[activeCategory];
                  const isSelected = selected.has(ex.id);
                  return (
                    <li key={ex.id}>
                      <button
                        type="button"
                        onClick={() => toggleExercice(ex.id)}
                        className={clsx(
                          'w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400',
                          isSelected
                            ? `${colors.bg} ring-2 ${colors.ring}`
                            : 'hover:bg-gray-50 active:bg-gray-100'
                        )}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={clsx(
                            'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
                            isSelected
                              ? `${colors.accent} border-transparent`
                              : 'border-gray-300 bg-white'
                          )}
                          aria-hidden
                        >
                          {isSelected && (
                            <CheckIcon className="w-3.5 h-3.5 text-white" />
                          )}
                        </span>
                        <span
                          className={clsx(
                            'text-sm font-medium',
                            isSelected ? colors.text : 'text-gray-700'
                          )}
                        >
                          {ex.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <footer className="shrink-0 px-4 py-3 border-t border-gray-100">
          <Button
            onClick={handleValidate}
            variant="action"
            size="md"
            rounded="lg"
            className="w-full"
          >
            Valider
          </Button>
        </footer>
      </div>
    </BottomSheetModal>
  );
}
