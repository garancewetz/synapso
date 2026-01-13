'use client';

import dynamic from 'next/dynamic';
import type { Progress } from '@/app/types';

type ProgressStatsChartProps = {
  progressList: Progress[];
  hideTitle?: boolean;
};

// Lazy load du composant ProgressStatsChart avec Recharts
export const LazyProgressStatsChart = dynamic<ProgressStatsChartProps>(
  () => import('./ProgressStatsChart').then((mod) => ({ default: mod.ProgressStatsChart })),
  {
    ssr: false, // Recharts ne supporte pas bien le SSR
    loading: () => null,
  }
);

