'use client';

import { useMemo } from 'react';
import type { Progress, HistoryEntry } from '@/app/types';
import { ProgressCard } from './ProgressCard';
import { ProgressTimelineEmpty } from './ProgressTimelineEmpty';
import { LazyProgressStatsChart as ProgressStatsChart } from './LazyProgressStatsChart';

type Props = {
  progressList: Progress[];
  allProgress?: Progress[];
  history?: HistoryEntry[];
  onEdit?: (progress: Progress) => void;
  onShare?: (progress: Progress) => void;
  hideChart?: boolean;
};

/**
 * Liste chronologique des progrès
 * Utilise ProgressCard pour afficher chaque progrès
 * Affiche un graphique encourageant avant les deux dernières cards
 * Le graphique utilise tous les progrès (allProgress) si fourni, sinon les progrès filtrés
 */
export function ProgressTimeline({ progressList, allProgress, onEdit, onShare, hideChart = false }: Props) {
  // Utiliser tous les progrès pour le graphique si fourni, sinon les progrès filtrés
  const progressForChart = allProgress ?? progressList;

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
    <div className="relative">
      {/* Fil de timeline à gauche - centré sur les points */}
      {/* Les points sont à -left-12 (48px) sur mobile et -left-16 (64px) sur desktop */}
      {/* Le centre d'un point de 32px (w-8) est à 16px de son bord */}
      {/* Donc le centre est à: 48px - 16px = 32px sur mobile, 64px - 16px = 48px sur desktop */}
      {/* La ligne fait 4px (w-1), donc on la centre avec left-1/2 -translate-x-1/2 */}
      <div className="absolute left-4 md:left-12 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-300 z-0 shadow-sm" />
      
      {/* Liste verticale des progrès avec points numérotés */}
      <div className="flex flex-col gap-8 md:gap-12 relative z-20 pl-12 md:pl-16">
        {/* Premiers progrès (tous sauf les 2 derniers) */}
        {firstProgress.map((progress) => {
          const { victoryNumber } = progressWithNumbers.find(p => p.progress.id === progress.id) || { victoryNumber: 0 };
          
          return (
            <div key={progress.id} className="relative z-20 flex items-start">
              {/* Point numéroté sur le fil - aligné avec le centre vertical de la card */}
              <div className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-white shadow-md flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {victoryNumber}
                  </span>
                </div>
              </div>
              
              {/* Card de progrès */}
              <div className="flex-1">
                <ProgressCard
                  progress={progress}
                  onEdit={onEdit}
                  onShare={onShare}
                />
              </div>
            </div>
          );
        })}
        
        {/* Graphique encourageant avant les deux dernières cards */}
        {!hideChart && progressForChart.length >= 2 && (
          <div className="relative z-20">
            <ProgressStatsChart progressList={progressForChart} />
          </div>
        )}
        
        {/* Les deux derniers progrès */}
        {lastTwoProgress.map((progress) => {
          const { victoryNumber } = progressWithNumbers.find(p => p.progress.id === progress.id) || { victoryNumber: 0 };
          
          return (
            <div key={progress.id} className="relative z-20 flex items-start">
              {/* Point numéroté sur le fil - aligné avec le centre vertical de la card */}
              <div className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-white shadow-md flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {victoryNumber}
                  </span>
                </div>
              </div>
              
              {/* Card de progrès */}
              <div className="flex-1">
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

