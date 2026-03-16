'use client';

import dynamic from 'next/dynamic';
import { Loader } from '@/app/components/ui';
import { ProgressButton } from '@/app/components/ui/ProgressButton';
import { ProgressTimeline, ProgressStatsChart } from '@/app/features/historique';
import type { Progress } from '@/app/types';
import type { HistoryEntry } from '@/app/types';

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false, loading: () => null }
);

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false, loading: () => null }
);

type Props = {
  filteredProgress: Progress[];
  filteredHistory: HistoryEntry[];
  deferredProgressList: Progress[];
  /** Liste complète des progrès (non paginée) pour le graphique cumulatif */
  fullProgressList: Progress[];
  loadingProgress: boolean;
  victoryNumbersById?: Record<number, number>;
  onEdit: (progress: Progress) => void;
  onShare: (progress: Progress) => void;
  onPin: () => void;
  onOpenSlideshow: () => void;
  hasUser: boolean;
  starEmoji: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
};

export function HistoriqueProgresSection({
  filteredProgress,
  filteredHistory,
  deferredProgressList,
  fullProgressList,
  loadingProgress,
  onEdit,
  onShare,
  onPin,
  onOpenSlideshow,
  hasUser,
  starEmoji,
  onLoadMore,
  hasMore,
  loadingMore,
  victoryNumbersById,
}: Props) {
  return (
    <MotionDiv
      key="progres"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 md:space-y-8 pb-24 xl:pb-8"
    >
      <section id="progres" className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>{starEmoji}</span>
            <span>Mes progrès</span>
          </h2>
        </div>

        {!loadingProgress && fullProgressList.length >= 2 && (
          <div>
            <ProgressStatsChart progressList={fullProgressList} />
          </div>
        )}

        {filteredProgress.length > 0 && (
          <ProgressButton
            onClick={onOpenSlideshow}
            variant="inline"
            label="Mode diaporama"
            ariaLabel="Voir en diaporama"
            emoji="📽️"
            iconPosition="right"
            className="w-full"
          />
        )}

        <AnimatePresence mode="wait">
          {loadingProgress ? (
            <MotionDiv
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] gap-4"
            >
              <Loader size="xl" />
              <p className="text-gray-600 font-medium">
                Chargement de tes progrès... 🌟
              </p>
            </MotionDiv>
          ) : (
            <MotionDiv
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <ProgressTimeline
                progressList={filteredProgress}
                history={filteredHistory}
                onEdit={onEdit}
                onShare={onShare}
                onPin={onPin}
                victoryNumbersById={victoryNumbersById}
              />
              {hasMore && onLoadMore && (
                <div className="flex justify-center pt-6 pb-2">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="min-h-[48px] px-6 py-3 rounded-xl text-base font-medium bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    aria-busy={loadingMore}
                    aria-label={loadingMore ? 'Chargement...' : 'Charger plus de progrès'}
                  >
                    {loadingMore ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader size="md" />
                        Chargement...
                      </span>
                    ) : (
                      'Charger plus de progrès'
                    )}
                  </button>
                </div>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>

      </section>
    </MotionDiv>
  );
}
