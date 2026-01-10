'use client';

import dynamic from 'next/dynamic';
import type { Progress } from '@/app/types';

type ProgressStatsChartProps = {
  progressList: Progress[];
  hideTitle?: boolean;
};

// Skeleton pendant le chargement
function ProgressStatsChartSkeleton() {
  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 w-full">
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="w-full h-64 sm:h-80 mb-4 bg-gray-100 rounded-xl animate-pulse" />
      <div className="flex justify-center gap-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Lazy load du composant ProgressStatsChart avec Recharts
export const LazyProgressStatsChart = dynamic<ProgressStatsChartProps>(
  () => import('./ProgressStatsChart').then((mod) => ({ default: mod.ProgressStatsChart })),
  {
    ssr: false, // Recharts ne supporte pas bien le SSR
    loading: () => <ProgressStatsChartSkeleton />,
  }
);

