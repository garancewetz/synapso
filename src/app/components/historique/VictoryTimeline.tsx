'use client';

import type { Victory } from '@/app/types';
import { VictoryCard } from './VictoryCard';

interface VictoryTimelineProps {
  victories: Victory[];
  onEdit?: (victory: Victory) => void;
}

/**
 * Liste chronologique des victoires
 * Utilise VictoryCard pour afficher chaque victoire
 */
export function VictoryTimeline({ victories, onEdit }: VictoryTimelineProps) {
  if (victories.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 shadow-sm p-8 text-center">
        <span className="text-4xl mb-3 block">🌱</span>
        <p className="text-amber-800 font-medium">Aucune victoire notée pour l&apos;instant</p>
        <p className="text-amber-600 text-sm mt-1">
          Tes réussites apparaîtront ici !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {victories.map((victory) => (
        <VictoryCard
          key={victory.id}
          victory={victory}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

