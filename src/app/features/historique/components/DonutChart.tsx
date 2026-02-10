'use client';

import { memo, type ReactNode } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/app/components/ui/Card';
import clsx from 'clsx';

type DonutChartItem = {
  name: string;
  value: number;
  icon: string;
  color: string;
  [key: string]: string | number;
};

type Props = {
  title: string;
  data: DonutChartItem[];
  emptyIcon: string;
  emptyMessage: string;
  fullWidth?: boolean;
  legendPosition?: 'bottom' | 'right';
  filterSlot?: ReactNode;
};

export const DonutChart = memo(function DonutChart({ title, data, emptyIcon, emptyMessage, fullWidth = false, legendPosition = 'bottom', filterSlot }: Props) {
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

  const isHorizontalLayout = legendPosition === 'right';

  return (
    <Card variant="default" padding="md" className={clsx(fullWidth && 'w-full')}>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {title}
      </h2>
      
      {/* Filtre optionnel sous le titre */}
      {filterSlot && <div className="mb-4">{filterSlot}</div>}
      
      {/* Sur mobile: toujours en colonne (légende en bas), sur desktop: selon legendPosition */}
      <div className={`flex flex-col items-center gap-4 ${isHorizontalLayout ? 'md:flex-row md:items-center md:gap-6' : ''}`}>
        {/* Graphique Donut */}
        <div className={`w-full h-48 xl:h-56 ${isHorizontalLayout ? 'md:flex-1' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} exercices`]}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Légende - toujours en grille sur mobile, colonne sur desktop si legendPosition="right" */}
        <div className={`w-full grid grid-cols-2 gap-2 ${isHorizontalLayout ? 'md:flex-1 md:flex md:flex-col' : ''}`}>
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <p className="font-medium text-gray-700 truncate text-xs">{item.name}</p>
                <span className="text-sm font-bold text-gray-800 ml-1">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

