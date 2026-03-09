'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import type { Progress, HistoryEntry } from '@/app/types';
import { ProgressCard } from './ProgressCard';
import { ProgressTimelineEmpty } from './ProgressTimelineEmpty';
import { ChevronIcon } from '@/app/components/ui/icons';
import { getWeekKey, getFriendlyWeekLabel } from '@/app/utils/date.utils';
import clsx from 'clsx';

type Props = {
  progressList: Progress[];
  allProgress?: Progress[];
  history?: HistoryEntry[];
  onEdit?: (progress: Progress) => void;
  onShare?: (progress: Progress) => void;
  onPin?: (updatedProgress: Progress) => void;
};

type WeekGroup = {
  weekKey: string;
  primaryLabel: string;
  secondaryLabel?: string;
  items: Progress[];
};

/**
 * Liste chronologique des progrès par semaine. Chaque semaine est un dropdown :
 * seul le contenu de la semaine ouverte est rendu dans le DOM.
 */
export function ProgressTimeline({ progressList, onEdit, onShare, onPin }: Props) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => new Set());
  const hasInitializedOpen = useRef(false);

  const progressWithNumbers = useMemo(() => {
    return progressList.map((progress, index) => ({
      progress,
      victoryNumber: progressList.length - index,
    }));
  }, [progressList]);

  const weeks = useMemo((): WeekGroup[] => {
    const byWeek = new Map<string, Progress[]>();
    for (const progress of progressList) {
      const key = getWeekKey(progress.createdAt);
      if (!key) continue;
      const list = byWeek.get(key) ?? [];
      list.push(progress);
      byWeek.set(key, list);
    }
    const sortedKeys = Array.from(byWeek.keys()).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((weekKey) => {
      const { primary, secondary } = getFriendlyWeekLabel(weekKey);
      return {
        weekKey,
        primaryLabel: primary,
        secondaryLabel: secondary,
        items: byWeek.get(weekKey) ?? [],
      };
    });
  }, [progressList]);

  const toggleWeek = useCallback((weekKey: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (weeks.length > 0 && !hasInitializedOpen.current) {
      hasInitializedOpen.current = true;
      setExpandedWeeks(new Set([weeks[0].weekKey]));
    }
  }, [weeks]);

  if (progressList.length === 0) {
    return <ProgressTimelineEmpty />;
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-linear-to-b from-amber-300 via-amber-400 to-amber-300 z-0 shadow-sm" />

      <div className="flex flex-col gap-3 relative z-20 pt-4 md:pt-6">
        {weeks.map(({ weekKey, primaryLabel, secondaryLabel, items }) => {
          const isExpanded = expandedWeeks.has(weekKey);
          return (
            <section key={weekKey} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleWeek(weekKey)}
                aria-expanded={isExpanded}
                aria-controls={`progress-week-${weekKey}`}
                id={`progress-week-trigger-${weekKey}`}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 min-h-[56px] rounded-xl px-4 py-3.5 text-left',
                  'bg-amber-50 border border-amber-200',
                  'active:bg-amber-100 md:hover:bg-amber-100',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                  'transition-colors touch-manipulation'
                )}
              >
                <div className="flex-1 min-w-0 flex flex-col items-start gap-0.5">
                  <span className="text-base font-semibold text-amber-900">{primaryLabel}</span>
                  {secondaryLabel && (
                    <span className="text-xs text-amber-700/80">{secondaryLabel}</span>
                  )}
                </div>
                <span className="text-sm text-amber-600 shrink-0" aria-hidden>
                  {items.length} progrès
                </span>
                <ChevronIcon
                  direction={isExpanded ? 'up' : 'down'}
                  className="w-5 h-5 text-amber-600 shrink-0 transition-transform"
                />
              </button>
              {isExpanded && (
                <div
                  id={`progress-week-${weekKey}`}
                  role="region"
                  aria-labelledby={`progress-week-trigger-${weekKey}`}
                  className="flex flex-col gap-6 md:gap-10 pt-4 md:pt-6 pl-0"
                >
                  {items.map((progress) => {
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
                          <ProgressCard
                            progress={progress}
                            onEdit={onEdit}
                            onShare={onShare}
                            onPin={onPin}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

