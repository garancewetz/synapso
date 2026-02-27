'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { BottomSheetModal } from '@/app/components/ui/BottomSheetModal';
import { Loader } from '@/app/components/ui/Loader';
import { Button } from '@/app/components/ui/Button';
import { CheckIcon } from '@/app/components/ui/icons';
import { useExercices } from '@/app/features/exercices/hooks/useExercices';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/app/constants/exercice.constants';
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

  // Réinitialiser la sélection quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(value));
    }
  }, [isOpen, value]);

  const toggleExercice = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleValidate = useCallback(() => {
    const selectedExercices: LinkedExercice[] = exercices
      .filter((ex) => selected.has(ex.id))
      .map((ex) => ({ id: ex.id, name: ex.name, category: ex.category }));
    onChange(selectedExercices);
    onClose();
  }, [selected, exercices, onChange, onClose]);

  // Grouper par catégorie
  const grouped = useMemo(() => {
    const groups: Record<string, typeof exercices> = {};
    for (const ex of exercices) {
      const cat = ex.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ex);
    }
    return groups;
  }, [exercices]);

  const selectedCount = selected.size;

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} showFooterClose={false}>
      <div className="px-5 py-4 flex flex-col max-h-[80vh]">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Lier des exercices
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {selectedCount > 0
            ? `${selectedCount} exercice${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''}`
            : 'Sélectionnez les exercices en rapport avec cette note'}
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader size="small" />
          </div>
        ) : exercices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun exercice disponible
          </p>
        ) : (
          <div className="overflow-y-auto flex-1 -mx-5 px-5 space-y-5">
            {Object.entries(grouped).map(([category, exs]) => {
              const colors = CATEGORY_COLORS[category as ExerciceCategory];
              const label = CATEGORY_LABELS[category as ExerciceCategory];

              return (
                <div key={category}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${colors.text}`}>
                    {label}
                  </p>
                  <div className="space-y-1">
                    {exs.map((ex) => {
                      const isSelected = selected.has(ex.id);
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => toggleExercice(ex.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 ${
                            isSelected
                              ? `${colors.bg} ring-2 ${colors.ring}`
                              : 'hover:bg-gray-50 active:bg-gray-100'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? `${colors.accent} border-transparent`
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? colors.text : 'text-gray-700'}`}>
                            {ex.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-gray-100">
          <Button
            onClick={handleValidate}
            variant="action"
            size="lg"
            rounded="lg"
            className="w-full"
          >
            Valider
          </Button>
        </div>
      </div>
    </BottomSheetModal>
  );
}
