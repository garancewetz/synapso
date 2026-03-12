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
  onPin?: (updatedProgress: Progress) => void;
};

export function ProgressTimeline({ progressList, onEdit, onShare, onPin }: Props) {
  const progressWithNumbers = useMemo(() => {
    return progressList.map((progress, index) => ({
      progress,
      victoryNumber: progressList.length - index,
    }));
  }, [progressList]);

  if (progressList.length === 0) {
    return <ProgressTimelineEmpty />;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-amber-300 via-amber-400 to-amber-300 z-0 shadow-sm" />

      <div className="flex flex-col gap-6 md:gap-10 relative z-20 pt-4 md:pt-6">
        {progressList.map((progress) => {
          const { victoryNumber } = progressWithNumbers.find((p) => p.progress.id === progress.id) ?? {
            victoryNumber: 0,
          };

          return (
            <div key={progress.id} className="relative z-20 pl-12">
              <div className="absolute left-4 -translate-x-1/2 top-4 z-30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-amber-500 border-2 border-white shadow-lg shadow-amber-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{victoryNumber}</span>
                </div>
              </div>
              <div className="w-full">
                <ProgressCard progress={progress} onEdit={onEdit} onShare={onShare} onPin={onPin} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

