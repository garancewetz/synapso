'use client';

import { useMemo } from 'react';
import type { Progress, HistoryEntry } from '@/app/types';
import { ProgressCard } from './ProgressCard';
import { ProgressTimelineEmpty } from './ProgressTimelineEmpty';

type Props = {
  progressList: Progress[];
  allProgress?: Progress[];
  history?: HistoryEntry[];
  onEdit?: (progress: Progress) => void;
  onShare?: (progress: Progress) => void;
};

/**
 * Liste chronologique des progrès
 * Utilise ProgressCard pour afficher chaque progrès
 */
export function ProgressTimeline({ progressList, onEdit, onShare }: Props) {

  // Calculer tous les numéros de victoire une seule fois (avant le return conditionnel)
  const progressWithNumbers = useMemo(() => {
    return progressList.map((progress, index) => {
      // Calculer le numéro de victoire : progressList est trié du plus récent au plus ancien
      // Le numéro correspond à l'ordre d'ajout : le plus ancien = #1, le plus récent = dernier numéro
      // progressList[index] = le plus récent en premier
      // Donc victoryNumber = progressList.length - index
      const victoryNumber = progressList.length - index;
      return { progress, victoryNumber };
    });
  }, [progressList]);

  if (progressList.length === 0) {
    return <ProgressTimelineEmpty />;
  }

  return (
    <div className="relative">
      {/* Fil de timeline à gauche derrière les cards */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-amber-300 via-amber-400 to-amber-300 z-0 shadow-sm" />

      {/* Liste verticale des progrès */}
      <div className="flex flex-col gap-8 md:gap-12 relative z-20 pt-6 md:pt-8">
        {/* Tous les progrès dans l'ordre chronologique */}
        {progressList.map((progress) => {
          const { victoryNumber } = progressWithNumbers.find(p => p.progress.id === progress.id) || { victoryNumber: 0 };

          return (
            <div key={progress.id} className="relative z-20 pl-12">
              {/* Numéro doré à gauche, aligné sur le fil */}
              <div className="absolute left-4 -translate-x-1/2 top-4 z-30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-amber-500 border-2 border-white shadow-lg shadow-amber-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {victoryNumber}
                  </span>
                </div>
              </div>

              {/* Card de progrès */}
              <div className="w-full">
                <ProgressCard
                  progress={progress}
                  onEdit={onEdit}
                  onShare={onShare}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

