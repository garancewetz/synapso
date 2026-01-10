'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import CategoryTabs from '@/app/components/CategoryTabs';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';

export default function CategoryTabsWrapper() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();

  // Pages où on ne veut pas afficher la navigation
  // Sur la page d'accueil, on masque car les CategoryCard font déjà le travail de navigation
  const shouldHide = 
    pathname === '/' || // Page d'accueil : CategoryCard remplacent la navigation
    pathname?.startsWith('/exercice/add') ||
    pathname?.startsWith('/exercice/edit') ||
    pathname?.startsWith('/aphasie/add') ||
    pathname?.startsWith('/aphasie/edit') ||
    pathname === '/settings';

  const { exercices } = useExercices();

  // Calculer les counts par catégorie
  const counts = useMemo(() => {
    if (shouldHide || !effectiveUser) {
      return CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<ExerciceCategory, number>);
    }

    return CATEGORY_ORDER.reduce((acc, cat) => ({
      ...acc,
      [cat]: exercices.filter(e => e.category === cat).length,
    }), {} as Record<ExerciceCategory, number>);
  }, [exercices, shouldHide, effectiveUser]);

  // Ne pas afficher si pas d'utilisateur (page 404, erreurs, etc.)
  if (shouldHide || !effectiveUser || loading) {
    return null;
  }

  return (
    <div className="hidden md:block max-w-5xl mx-auto pt-4">
      <CategoryTabs counts={counts} />
    </div>
  );
}
