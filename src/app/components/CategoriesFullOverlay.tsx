'use client';

import { useMemo } from 'react';
import { CategoryCardWithProgress } from '@/app/features/exercices';
import { useExercices, useRelatedStretchingByCategory } from '@/app/features/exercices';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import { Button } from '@/app/components/ui/Button';
import { CloseIcon } from '@/app/components/ui/icons';

export function CategoriesFullOverlay() {
  const { categoriesOverlayOpen, setCategoriesOverlayOpen } = useLayoutContext();
  const { exercices } = useExercices({ includeArchived: false });
  const { relatedStretchingByCategory } = useRelatedStretchingByCategory();

  const exercicesByCategory = useMemo(() => {
    const active = exercices.filter((e) => !e.archived);
    const map = new Map<ExerciceCategory, number>();
    CATEGORY_ORDER.forEach((category) => {
      map.set(category, active.filter((e) => e.category === category).length);
    });
    return map;
  }, [exercices]);

  if (!categoriesOverlayOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-white"
      role="dialog"
      aria-modal="true"
      aria-label="Choisir une catégorie"
    >
      <div className="flex items-center justify-between shrink-0 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Catégories</h2>
        <Button
          type="button"
          iconOnly
          onClick={() => setCategoriesOverlayOpen(false)}
          className="!p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          aria-label="Fermer"
        >
          <CloseIcon className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {CATEGORY_ORDER.map((category) => (
            <div key={category} className="min-h-[88px]">
              <CategoryCardWithProgress
                category={category}
                total={exercicesByCategory.get(category) ?? 0}
                relatedStretchingCount={relatedStretchingByCategory[category] ?? 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
