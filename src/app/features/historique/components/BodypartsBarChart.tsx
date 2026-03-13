'use client';

import { memo, type ReactNode } from 'react';
import { Card } from '@/app/components/ui/Card';
import type { DonutChartItem } from '@/app/features/historique/utils/historique.types';

type Props = {
  title: string;
  data: DonutChartItem[];
  emptyIcon: string;
  emptyMessage: string;
  filterSlot?: ReactNode;
};

export const BodypartsBarChart = memo(function BodypartsBarChart({
  title,
  data,
  emptyIcon,
  emptyMessage,
  filterSlot,
}: Props) {
  if (data.length === 0) {
    return (
      <Card variant="default" padding="md">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          {title}
        </h2>
        {filterSlot && <div className="mb-4">{filterSlot}</div>}
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">{emptyIcon}</span>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  const displayData = data.slice(0, 6);
  const maxValue = Math.max(...displayData.map((item) => item.value));

  return (
    <Card variant="default" padding="md" className="w-full">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          {title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">6 premières catégories</p>
      </div>

      {filterSlot && <div className="mb-4">{filterSlot}</div>}

      <ul className="flex flex-col gap-3" role="list" aria-label="Zones travaillées avec nombre d'exercices">
        {displayData.map((item) => (
          <li key={item.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-2 min-w-0 shrink-0">
                <span className="text-lg" aria-hidden>{item.icon}</span>
                <span className="font-medium text-gray-700 truncate text-sm">{item.name}</span>
              </span>
              <span className="text-sm font-bold text-gray-800 tabular-nums shrink-0">
                {item.value} exercice{item.value > 1 ? 's' : ''}
              </span>
            </div>
            <div
              className="h-6 w-full rounded-md overflow-hidden bg-gray-100"
              role="img"
              aria-label={`${item.name}: ${item.value} exercices`}
            >
              <div
                className="h-full rounded-md transition-[width] duration-300 ease-out"
                style={{
                  width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%',
                  backgroundColor: item.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
});
