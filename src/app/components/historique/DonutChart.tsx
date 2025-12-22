'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartItem {
  name: string;
  value: number;
  icon: string;
  color: string;
  [key: string]: string | number;
}

interface DonutChartProps {
  title: string;
  data: DonutChartItem[];
  emptyIcon: string;
  emptyMessage: string;
}

export function DonutChart({ title, data, emptyIcon, emptyMessage }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          {title}
        </h2>
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">{emptyIcon}</span>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {title}
      </h2>
      
      <div className="flex flex-col items-center gap-4">
        {/* Graphique Donut */}
        <div className="w-full h-48 xl:h-56">
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

        {/* Légende */}
        <div className="w-full grid grid-cols-2 gap-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <p className="font-medium text-gray-700 truncate text-xs">{item.name}</p>
                <span className="text-sm font-bold text-gray-900 ml-1">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

