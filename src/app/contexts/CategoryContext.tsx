'use client';

import { createContext, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { ExerciceCategory } from '@/app/types/exercice';

type CategoryContextType = {
  activeCategory: ExerciceCategory | null;
  setActiveCategory: (category: ExerciceCategory | null) => void;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: PropsWithChildren) {
  const [activeCategory, setActiveCategory] = useState<ExerciceCategory | null>(null);

  return (
    <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
}
