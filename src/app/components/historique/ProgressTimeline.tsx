'use client';

import { useMemo } from 'react';
import type { Progress, HistoryEntry } from '@/app/types';
import { ProgressCard } from './ProgressCard';
import { ProgressTimelineEmpty } from './ProgressTimelineEmpty';
import { ProgressStatsChart } from './ProgressStatsChart';

type Props = {
  progressList: Progress[];
  allProgress?: Progress[];
  history?: HistoryEntry[];
  onEdit?: (progress: Progress) => void;
  hideChart?: boolean;
};

/**
 * Liste chronologique des progrès
 * Utilise ProgressCard pour afficher chaque progrès
 * Affiche un graphique encourageant avant les deux dernières cards
 * Le graphique utilise tous les progrès (allProgress) si fourni, sinon les progrès filtrés
 */
export function ProgressTimeline({ progressList, allProgress, history, onEdit, hideChart = false }: Props) {
  // Utiliser tous les progrès pour le graphique si fourni, sinon les progrès filtrés
  const progressForChart = allProgress ?? progressList;

  // Séparer les progrès : les deux derniers vs les autres
  const { firstProgress, lastTwoProgress } = useMemo(() => {
    if (progressList.length <= 2) {
      return { firstProgress: [], lastTwoProgress: progressList };
    }
    return {
      firstProgress: progressList.slice(0, -2),
      lastTwoProgress: progressList.slice(-2),
    };
  }, [progressList]);

  if (progressList.length === 0) {
    return <ProgressTimelineEmpty />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Premiers progrès (tous sauf les 2 derniers) */}
      {firstProgress.map((progress) => (
        <ProgressCard
          key={progress.id}
          progress={progress}
          onEdit={onEdit}
        />
      ))}
      
      {/* Graphique encourageant avant les deux dernières cards */}
      {!hideChart && progressForChart.length >= 2 && (
        <div className="md:col-span-2">
          <ProgressStatsChart progressList={progressForChart} />
        </div>
      )}
      
      {/* Les deux derniers progrès */}
      {lastTwoProgress.map((progress) => (
        <ProgressCard
          key={progress.id}
          progress={progress}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

