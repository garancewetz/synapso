'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import type { HeatmapDay } from '@/app/utils/historique.utils';

type DayDetailModalContextType = {
  selectedDay: HeatmapDay | null;
  openDayDetail: (day: HeatmapDay) => void;
  closeDayDetail: () => void;
};

const DayDetailModalContext = createContext<DayDetailModalContextType | undefined>(undefined);

export function DayDetailModalProvider({ children }: PropsWithChildren) {
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  const openDayDetail = useCallback((day: HeatmapDay) => {
    setSelectedDay(day);
  }, []);

  const closeDayDetail = useCallback(() => {
    setSelectedDay(null);
  }, []);

  return (
    <DayDetailModalContext.Provider value={{ selectedDay, openDayDetail, closeDayDetail }}>
      {children}
    </DayDetailModalContext.Provider>
  );
}

export function useDayDetailModal() {
  const context = useContext(DayDetailModalContext);
  if (context === undefined) {
    throw new Error('useDayDetailModal must be used within a DayDetailModalProvider');
  }
  return context;
}

