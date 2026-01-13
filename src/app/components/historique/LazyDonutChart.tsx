'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

type DonutChartItem = {
  name: string;
  value: number;
  icon: string;
  color: string;
  [key: string]: string | number;
};

type DonutChartProps = {
  title: string;
  data: DonutChartItem[];
  emptyIcon: string;
  emptyMessage: string;
  fullWidth?: boolean;
  legendPosition?: 'bottom' | 'right';
  filterSlot?: ReactNode;
};

// Lazy load du composant DonutChart avec Recharts
export const LazyDonutChart = dynamic<DonutChartProps>(
  () => import('./DonutChart').then((mod) => ({ default: mod.DonutChart })),
  {
    ssr: false, // Recharts ne supporte pas bien le SSR
    loading: () => null,
  }
);

