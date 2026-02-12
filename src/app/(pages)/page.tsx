'use client';

import { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { WelcomeHeaderWrapper } from '@/app/features/home';
import { SegmentedControl } from '@/app/components/ui';
import { UserIcon, BookIcon, RocketIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/features/exercices';
import { useProgressModal } from '@/app/features/progress';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/lib/api-queries';
import { useRelatedStretchingByCategory } from '@/app/features/exercices';
import { usePrefetchPreviousDates } from '@/app/features/time-machine';
import { useHomeTabs, HomeExercicesTab, HomeJournalTab, HomeProgressionTab } from '@/app/features/home';
import { usePrefetchCommonPages } from '@/app/hooks/usePrefetchCommonPages';

const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
);

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

const ProgressBottomSheet = dynamic(
  () => import('@/app/features/progress').then(mod => ({ default: mod.ProgressBottomSheet })),
  { ssr: false }
);

export default function Home() {
  const { effectiveUser, loading: userLoading } = useUser();
  const progressModal = useProgressModal();
  const queryClient = useQueryClient();
  const hasJournal = effectiveUser?.hasJournal ?? false;
  
  // ⚡ QUERY PREFETCHING: Précharger les données des dates précédentes en arrière-plan
  usePrefetchPreviousDates();
  
  // ⚡ PERFORMANCE MOBILE: Précharger les pages fréquemment visitées
  usePrefetchCommonPages();
  
  const { exercices, error: exercicesError } = useExercices();
  const { relatedStretchingByCategory } = useRelatedStretchingByCategory();
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
    // ⚡ TANSTACK QUERY: Invalider les queries concernées
    // TanStack Query gère automatiquement la réactivité - les queries actives sont refetchées automatiquement
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.progress.all,
      refetchType: 'active',
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.categoryStats.all,
      refetchType: 'active',
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.exercices.all,
      refetchType: 'active',
    });
  }, [queryClient]);

  return (
    <section>
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header - uniquement sur la page d'accueil */}
        <WelcomeHeaderWrapper />
        
        {/* Contenu principal */}
        <div className="px-3 md:px-4 pb-12 md:pb-8">
          <AnimatePresence mode="wait">
            {userLoading ? (
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
                className="flex flex-col items-center justify-center py-12 gap-3"
              >
                <div className="text-gray-500">Impossible de charger votre profil.</div>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-blue-600 underline"
                >
                  Réessayer
                </button>
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
                  <>
                   <HomeExercicesTab
                    exercices={exercices}
                    relatedStretchingByCategory={relatedStretchingByCategory}
                    error={exercicesError}
                  />
                  </>

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
