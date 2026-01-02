'use client';

import type { Victory } from '@/app/types';
import { VictoryCard } from './VictoryCard';
import { VictoryTimelineEmpty } from './VictoryTimelineEmpty';

type Props = {
  victories: Victory[];
  onEdit?: (victory: Victory) => void;
};

/**
 * Liste chronologique des victoires
 * Utilise VictoryCard pour afficher chaque victoire
 */
export function VictoryTimeline({ victories, onEdit }: Props) {
  if (victories.length === 0) {
    return <VictoryTimelineEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
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

