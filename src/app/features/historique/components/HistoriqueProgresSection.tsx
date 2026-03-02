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
  loadingProgress: boolean;
  onEdit: (progress: Progress) => void;
  onShare: (progress: Progress) => void;
  onPin: () => void;
  onOpenCreate: () => void;
  onOpenSlideshow: () => void;
  hasUser: boolean;
  starEmoji: string;
};

export function HistoriqueProgresSection({
  filteredProgress,
  filteredHistory,
  deferredProgressList,
  loadingProgress,
  onEdit,
  onShare,
  onPin,
  onOpenCreate,
  onOpenSlideshow,
  hasUser,
  starEmoji,
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
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>{starEmoji}</span>
            <span>Mes progrès</span>
          </h2>
          <div className="flex items-center gap-2">
            {hasUser && (
              <ProgressButton
                onClick={onOpenCreate}
                variant="inline"
                label="Noter un progrès"
                ariaLabel="Ajouter un progrès"
              />
            )}
          </div>
        </div>

        {!loadingProgress && deferredProgressList.length >= 2 && (
          <div>
            <ProgressStatsChart progressList={deferredProgressList} />
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
              <Loader size="large" />
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
              />
            </MotionDiv>
          )}
        </AnimatePresence>

        {hasUser && (
          <div className="flex justify-center pt-4">
            <ProgressButton
              onClick={onOpenCreate}
              variant="inline"
              label="Noter un progrès"
            />
          </div>
        )}
      </section>
    </MotionDiv>
  );
}
