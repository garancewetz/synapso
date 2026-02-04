'use client';

import { useState, useMemo, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { CategoryCardWithProgress, MenuLink, SiteMapGroup, WelcomeHeaderWrapper } from '@/app/components';
import { SegmentedControl } from '@/app/components/ui';
import { RocketIcon, MapIcon, ChatIcon, BookIcon, PinIcon, SparklesIcon, UserIcon, PlusIcon } from '@/app/components/ui/icons';
import { CATEGORY_ORDER, AVAILABLE_BODYPARTS, BODYPART_TO_CATEGORY } from '@/app/constants/exercice.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { MENU_COLORS } from '@/app/constants/card.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useCategoryStats } from '@/app/hooks/useCategoryStats';
import { useProgress, triggerProgressRefresh } from '@/app/hooks/useProgress';
import { apiCache } from '@/app/utils/api-cache.utils';

// ⚡ PERFORMANCE: Charger dynamiquement les composants lourds
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

type TabValue = 'exercices' | 'journal' | 'progression';

export default function Home() {
  const { effectiveUser, loading: userLoading } = useUser();
  const progressModal = useProgressModal();
  const hasJournal = effectiveUser?.hasJournal ?? false;
  const [activeTab, setActiveTab] = useState<TabValue>('exercices');
  
  const { exercices, refetch: refetchExercices } = useExercices();
  
  // Charger les étirements pour calculer les étirements liés à chaque catégorie
  const { exercices: stretchingExercices } = useExercices({
    category: 'STRETCHING',
  });

  // Charger les stats de progression par catégorie
  const { stats: categoryStats, loading: loadingStats, refresh: refreshCategoryStats } = useCategoryStats({
    userId: effectiveUser?.id ?? null,
    resetFrequency: effectiveUser?.resetFrequency || 'DAILY',
  });

  // Charger les progrès
  const { refetch: refetchProgress } = useProgress();

  // ⚡ PERFORMANCE: Mémoriser le callback de succès pour éviter les re-renders
  const handleProgressSuccess = useCallback(() => {
    // Invalider le cache des progrès pour forcer le rafraîchissement
    apiCache.invalidateByPrefix('/api/progress');
    // Notifier tous les hooks useProgress pour qu'ils se rafraîchissent
    triggerProgressRefresh();
    // Rafraîchir les progrès localement
    refetchProgress();
    // Rafraîchir les stats de catégorie
    refreshCategoryStats();
    // Rafraîchir aussi la liste des exercices au cas où un progrès orthophonie a été créé
    refetchExercices();
  }, [refetchProgress, refetchExercices, refreshCategoryStats]);

  // Calculer les étirements liés par catégorie
  const relatedStretchingByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      UPPER_BODY: 0,
      CORE: 0,
      LOWER_BODY: 0,
      STRETCHING: 0,
    };
    
    CATEGORY_ORDER.forEach((category) => {
      if (category === 'STRETCHING') {
        return; // Pas d'étirements liés pour la catégorie étirement elle-même
      }
      
      // Obtenir les bodyparts de cette catégorie
      const categoryBodyparts = AVAILABLE_BODYPARTS.filter(
        bp => BODYPART_TO_CATEGORY[bp] === category
      );
      
      // Compter les étirements qui ciblent au moins un bodypart de cette catégorie
      counts[category] = stretchingExercices.filter(ex =>
        ex.bodyparts.some(bp => categoryBodyparts.includes(bp as typeof AVAILABLE_BODYPARTS[number]))
      ).length;
    });
    
    return counts;
  }, [stretchingExercices]);

  // Options des onglets
  const tabOptions = useMemo(() => {
    const options: Array<{ value: TabValue; label: string; icon?: ReactNode }> = [];
    
    options.push({ 
      value: 'exercices', 
      label: 'Exercices',
      icon: <UserIcon className="w-5 h-5" />
    });
    
    if (hasJournal) {
      options.push({ 
        value: 'journal', 
        label: 'Journal',
        icon: <ChatIcon className="w-5 h-5" />
      });
    }
    
    options.push({ 
      value: 'progression', 
      label: 'Progression',
      icon: <RocketIcon className="w-5 h-5" />
    });
    
    return options;
  }, [hasJournal]);

  // Si l'onglet actif n'est plus disponible, changer vers 'exercices'
  const currentActiveTab = useMemo(() => {
    const isTabAvailable = tabOptions.some(opt => opt.value === activeTab);
    return isTabAvailable ? activeTab : 'exercices';
  }, [activeTab, tabOptions]);

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
                {/* Onglets */}
                {tabOptions.length > 0 && (
                  <div>
                    <SegmentedControl
                      options={tabOptions}
                      value={currentActiveTab}
                      onChange={setActiveTab}
                      fullWidth
                      size="md"
                      variant="navigation"
                    />
                  </div>
                )}

                {/* Contenu selon l'onglet actif */}
                {currentActiveTab === 'exercices' && (
                  <div className="space-y-4">
                    {/* Cartes de catégories avec progression intégrée - toujours afficher les 4 catégories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {CATEGORY_ORDER.map((category, index) => {
                        const categoryExercices = exercices.filter(e => e.category === category);

                        return (
                          <MotionDiv
                            key={category}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15, delay: index * 0.03 }}
                          >
                            <CategoryCardWithProgress
                              category={category}
                              total={categoryExercices.length}
                              completedCount={loadingStats ? 0 : categoryStats[category]}
                              relatedStretchingCount={relatedStretchingByCategory[category]}
                            />
                          </MotionDiv>
                        );
                      })}
                    </div>
                    {/* Action secondaire : Vue globale */}
                    <MenuLink
                      title="Vue globale"
                      icon="🔍"
                      description="Tous les exercices et étirements avec filtres"
                      href="/exercices/all"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isSecondary={true}
                    />
                  </div>
                )}

              {currentActiveTab === 'journal' && hasJournal && (
                <SiteMapGroup
                  title="Journal"
                  icon={<ChatIcon className="w-5 h-5" />}
                  description="Mes tâches et mes notes"
                  href="/journal"
                  iconBgColor={SITEMAP_ICON_STYLES.primary.journal.bg}
                  iconTextColor={SITEMAP_ICON_STYLES.primary.journal.text}
                >
                  <MenuLink
                    title="Tâches"
                    icon={<PinIcon className="w-5 h-5" />}
                    description="Voir mes tâches"
                    href="/journal/tasks"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                  />
                  <MenuLink
                    title="Mes notes"
                    icon={<BookIcon className="w-5 h-5" />}
                    description="Voir toutes"
                    href="/journal/notes"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                  />
                </SiteMapGroup>
              )}

              {currentActiveTab === 'progression' && (
                <div className="space-y-3">
                  <MenuLink
                    title="Voir mes progrès"
                    icon={<SparklesIcon className="w-5 h-5" />}
                    description="Tous mes progrès et leur évolution dans le temps"
                    href="/historique#progres"
                    iconBgColor={MENU_COLORS.PROGRES.bg}
                    iconTextColor={MENU_COLORS.PROGRES.text}
                  />
                  <MenuLink
                    title="Voir mes Statistiques"
                    icon={<MapIcon className="w-5 h-5" />}
                    description="Mon activité, mes graphiques et les zones travaillées"
                    href="/historique#statistiques"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
                  />
                  <MenuLink
                    title="Noter un progrès"
                    icon={<PlusIcon className="w-5 h-5" />}
                    description="Célébrer une nouvelle réussite ou victoire"
                    href="/historique?action=add-progress"
                    iconBgColor={MENU_COLORS.PROGRES.bg}
                    iconTextColor={MENU_COLORS.PROGRES.text}
                  />
                </div>
              )}

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
