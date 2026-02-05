'use client';

import { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { WelcomeHeaderWrapper } from '@/app/components';
import { SegmentedControl } from '@/app/components/ui';
import { UserIcon, BookIcon, RocketIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useCategoryStats } from '@/app/hooks/useCategoryStats';
import { useProgress, triggerProgressRefresh } from '@/app/hooks/useProgress';
import { useRelatedStretchingByCategory } from '@/app/hooks/useRelatedStretchingByCategory';
import { useHomeTabs } from '@/app/hooks/useHomeTabs';
import { apiCache } from '@/app/utils/api-cache.utils';
import { HomeExercicesTab } from '@/app/components/home/HomeExercicesTab';
import { HomeJournalTab } from '@/app/components/home/HomeJournalTab';
import { HomeProgressionTab } from '@/app/components/home/HomeProgressionTab';

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

const ProgressBottomSheet = dynamic(
  () => import('@/app/components/ProgressBottomSheet').then(mod => ({ default: mod.ProgressBottomSheet })),
  { ssr: false }
);

export default function Home() {
  const { effectiveUser, loading: userLoading } = useUser();
  const progressModal = useProgressModal();
  const hasJournal = effectiveUser?.hasJournal ?? false;
  
  const { exercices, refetch: refetchExercices } = useExercices();
  const { relatedStretchingByCategory } = useRelatedStretchingByCategory();
  const { stats: categoryStats, loading: loadingStats, refresh: refreshCategoryStats } = useCategoryStats({
    userId: effectiveUser?.id ?? null,
    resetFrequency: effectiveUser?.resetFrequency || 'DAILY',
  });
  const { refetch: refetchProgress } = useProgress();
  const { activeTab, setActiveTab, tabOptionsData } = useHomeTabs(hasJournal);

  const tabOptions = useMemo(() => {
    const getIcon = (iconName: 'UserIcon' | 'BookIcon' | 'RocketIcon') => {
      switch (iconName) {
        case 'UserIcon':
          return <UserIcon className="w-5 h-5" />;
        case 'BookIcon':
          return <BookIcon className="w-5 h-5" />;
        case 'RocketIcon':
          return <RocketIcon className="w-5 h-5" />;
      }
    };

    return tabOptionsData.map(opt => ({
      value: opt.value,
      label: opt.label,
      icon: getIcon(opt.iconName),
    }));
  }, [tabOptionsData]);

  const handleProgressSuccess = useCallback(() => {
    apiCache.invalidateByPrefix('/api/progress');
    triggerProgressRefresh();
    refetchProgress();
    refreshCategoryStats();
    refetchExercices();
  }, [refetchProgress, refetchExercices, refreshCategoryStats]);

  return (
    <section>
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header - uniquement sur la page d'accueil */}
        <WelcomeHeaderWrapper />
        
        {/* Contenu principal */}
        <div className="px-3 md:px-4 pb-12 md:pb-8">
          <AnimatePresence mode="wait">
            {!effectiveUser && userLoading ? (
              <MotionDiv
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-gray-500">Chargement...</div>
              </MotionDiv>
            ) : !effectiveUser ? (
              <MotionDiv
                key="no-user"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-gray-500">Chargement...</div>
              </MotionDiv>
            ) : (
              <MotionDiv
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {tabOptions.length > 0 && (
                  <div>
                    <SegmentedControl
                      options={tabOptions}
                      value={activeTab}
                      onChange={setActiveTab}
                      fullWidth
                      size="md"
                      variant="navigation"
                    />
                  </div>
                )}

                {activeTab === 'exercices' && (
                  <HomeExercicesTab
                    exercices={exercices}
                    categoryStats={categoryStats}
                    relatedStretchingByCategory={relatedStretchingByCategory}
                    loadingStats={loadingStats}
                  />
                )}

                {activeTab === 'journal' && hasJournal && <HomeJournalTab />}

                {activeTab === 'progression' && <HomeProgressionTab />}

              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal d'édition de progrès */}
      {effectiveUser && (
        <ProgressBottomSheet
          isOpen={progressModal.isOpen}
          onClose={progressModal.close}
          onSuccess={handleProgressSuccess}
          userId={effectiveUser.id}
          progressToEdit={progressModal.progressToEdit}
          initialContent={progressModal.initialContent}
          initialEmoji={progressModal.initialEmoji}
        />
      )}
    </section>
  );
}
