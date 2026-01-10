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

// Skeleton pendant le chargement
function DonutChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-full h-48 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full bg-gray-100 animate-pulse" />
        </div>
        <div className="w-full grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy load du composant DonutChart avec Recharts
export const LazyDonutChart = dynamic<DonutChartProps>(
  () => import('./DonutChart').then((mod) => ({ default: mod.DonutChart })),
  {
    ssr: false, // Recharts ne supporte pas bien le SSR
    loading: () => <DonutChartSkeleton />,
  }
);

