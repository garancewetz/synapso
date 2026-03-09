'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { ExerciceCategory } from '@/app/types/exercice';

type LayoutContextValue = {
  preserveDate: (path: string) => string;
  pendingShareCount: number;
  notificationBadge: ReactNode;
  navCategories: {
    forNav: ExerciceCategory[];
    forDesktop: ExerciceCategory[];
  };
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
