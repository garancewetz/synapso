'use client';

import { useMemo } from 'react';
import type { Victory, HistoryEntry } from '@/app/types';
import { VictoryCard } from './VictoryCard';
import { VictoryTimelineEmpty } from './VictoryTimelineEmpty';
import { VictoryStatsChart } from './VictoryStatsChart';

type Props = {
  victories: Victory[];
  allVictories?: Victory[];
  history?: HistoryEntry[];
  onEdit?: (victory: Victory) => void;
  hideChart?: boolean;
};

/**
 * Liste chronologique des victoires
 * Utilise VictoryCard pour afficher chaque victoire
 * Affiche un graphique encourageant avant les deux dernières cards
 * Le graphique utilise toutes les victoires (allVictories) si fourni, sinon les victoires filtrées
 */
export function VictoryTimeline({ victories, allVictories, history, onEdit, hideChart = false }: Props) {
  // Utiliser toutes les victoires pour le graphique si fourni, sinon les victoires filtrées
  const victoriesForChart = allVictories ?? victories;

  // Séparer les victoires : les deux dernières vs les autres
  const { firstVictories, lastTwoVictories } = useMemo(() => {
    if (victories.length <= 2) {
      return { firstVictories: [], lastTwoVictories: victories };
    }
    return {
      firstVictories: victories.slice(0, -2),
      lastTwoVictories: victories.slice(-2),
    };
  }, [victories]);

  if (victories.length === 0) {
    return <VictoryTimelineEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Premières victoires (toutes sauf les 2 dernières) */}
      {firstVictories.map((victory) => (
        <VictoryCard
          key={victory.id}
          victory={victory}
          onEdit={onEdit}
        />
      ))}
      
      {/* Graphique encourageant avant les deux dernières cards */}
      {!hideChart && victoriesForChart.length >= 2 && (
        <div className="md:col-span-2">
          <VictoryStatsChart victories={victoriesForChart} />
        </div>
      )}
      
      {/* Les deux dernières victoires */}
      {lastTwoVictories.map((victory) => (
        <VictoryCard
          key={victory.id}
          victory={victory}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

