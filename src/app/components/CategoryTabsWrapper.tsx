'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import CategoryTabs from '@/app/components/CategoryTabs';
import { useUser } from '@/app/contexts/UserContext';
import { ExerciceCategory } from '@/app/types/exercice';
import { USE_MOCK_DATA, MOCK_EXERCICES } from '@/app/datas/mockExercices';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';

export default function CategoryTabsWrapper() {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const [counts, setCounts] = useState<Record<ExerciceCategory, number>>(
    CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<ExerciceCategory, number>)
  );

  // Pages où on ne veut pas afficher la navigation
  // Sur la page d'accueil, on masque car les CategoryCard font déjà le travail de navigation
  const shouldHide = 
    pathname === '/' || // Page d'accueil : CategoryCard remplacent la navigation
    pathname?.startsWith('/exercice/add') ||
    pathname?.startsWith('/exercice/edit') ||
    pathname?.startsWith('/aphasie/add') ||
    pathname?.startsWith('/aphasie/edit') ||
    pathname === '/settings';

  useEffect(() => {
    if (shouldHide || !currentUser) {
      setCounts(
        CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<ExerciceCategory, number>)
      );
      return;
    }

    if (USE_MOCK_DATA) {
      const mockCounts = CATEGORY_ORDER.reduce((acc, cat) => ({
        ...acc,
        [cat]: MOCK_EXERCICES.filter(e => e.category === cat).length,
      }), {} as Record<ExerciceCategory, number>);
      setCounts(mockCounts);
      return;
    }

    // Charger les exercices pour calculer les counts
    fetch(`/api/exercices?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const calculatedCounts = CATEGORY_ORDER.reduce((acc, cat) => ({
            ...acc,
            [cat]: data.filter((e: { category: ExerciceCategory }) => e.category === cat).length,
          }), {} as Record<ExerciceCategory, number>);
          setCounts(calculatedCounts);
        }
      })
      .catch(() => {
        // En cas d'erreur, garder les counts à 0
      });
  }, [currentUser, shouldHide, pathname]);

  if (shouldHide) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4">
      <CategoryTabs counts={counts} />
    </div>
  );
}

