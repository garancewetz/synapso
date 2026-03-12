'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { NavMenuType } from '@/app/constants/settings.constants';

type LayoutContextValue = {
  preserveDate: (path: string) => string;
  pendingShareCount: number;
  notificationBadge: ReactNode;
  navCategories: {
    forNav: ExerciceCategory[];
    forDesktop: ExerciceCategory[];
  };
  /** True when bottom nav shows the "fer à cheval" layout (Accueil above the bar), i.e. 5 categories. */
  hasHorseshoeNav: boolean;
  /** Type de menu : category = barre catégories, slide = menu qui s'agrandit avec catégories en dessous */
  navMenuType: NavMenuType;
  setNavMenuType: (value: NavMenuType) => void;
  /** Pour rétrocompat / raccourci : true si navMenuType === 'category' */
  showCategoryMenu: boolean;
  /** Overlay plein écran "Catégories" (menu page) */
  categoriesOverlayOpen: boolean;
  setCategoriesOverlayOpen: (open: boolean) => void;
  /** Bottom sheet Catégories (menu slide) */
  categoriesSlideOpen: boolean;
  setCategoriesSlideOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayoutContext(): LayoutContextValue {
  const value = useContext(LayoutContext);
  if (!value) {
    throw new Error('useLayoutContext must be used within LayoutProvider');
  }
  return value;
}

type LayoutProviderProps = {
  value: LayoutContextValue;
  children: ReactNode;
};

export function LayoutProvider({ value, children }: LayoutProviderProps) {
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}
