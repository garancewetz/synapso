'use client';

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';

// Données de démonstration pour montrer une progression encourageante
const DEMO_DATA = [
  { week: 'Sem 1', physique: 2, total: 2 },
  { week: 'Sem 2', physique: 3, total: 3 },
  { week: 'Sem 3', physique: 5, total: 5 },
  { week: 'Sem 4', physique: 6, total: 6 },
  { week: 'Sem 5', physique: 8, total: 8 },
  { week: 'Sem 6', physique: 10, total: 10 },
  { week: 'Sem 7', physique: 12, total: 12 },
  { week: 'Sem 8', physique: 15, total: 15 },
];

// Constantes pour les couleurs du graphique
const COLORS = {
  PHYSIQUE: '#F97316',
} as const;

export function OnboardingProgressChart() {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
        <span>🏆</span>
        <span>Mes progrès</span>
      </h3>
      <div className="w-full h-48 sm:h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEMO_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPhysiqueDemo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.9}/>
                <stop offset="50%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.7}/>
                <stop offset="95%" stopColor={COLORS.PHYSIQUE} stopOpacity={0.15}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6B7280' }}
              allowDecimals={false}
              domain={[0, 18]}
            />
            <Area 
              type="monotone" 
              dataKey="physique" 
              stackId="1"
              stroke={COLORS.PHYSIQUE} 
              fill="url(#colorPhysiqueDemo)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="text-gray-700 font-medium">💪 Progrès physique</span>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">
        Suis ta progression au fil du temps ✨
      </p>
    </div>
  );
}

