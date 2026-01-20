'use client';

import { useState, useMemo, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { CategoryCardWithProgress, MenuLink, SiteMapGroup, WelcomeHeaderWrapper } from '@/app/components';
import { SegmentedControl } from '@/app/components/ui';
import { MapIcon, ChatIcon, BookIcon, PinIcon, SparklesIcon, UserIcon } from '@/app/components/ui/icons';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { MENU_COLORS } from '@/app/constants/card.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useCategoryStats } from '@/app/hooks/useCategoryStats';
import { useProgress } from '@/app/hooks/useProgress';

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

type TabValue = 'corps' | 'aphasie' | 'parcours';

export default function Home() {
  const { effectiveUser, loading: userLoading } = useUser();
  const progressModal = useProgressModal();
  const isAphasic = effectiveUser?.isAphasic ?? false;
  const [activeTab, setActiveTab] = useState<TabValue>('corps');
  
  const { exercices, refetch: refetchExercices } = useExercices();

  // Charger les stats de progression par catégorie
  const { stats: categoryStats, loading: loadingStats } = useCategoryStats({
    userId: effectiveUser?.id ?? null,
    resetFrequency: effectiveUser?.resetFrequency || 'DAILY',
  });

  // Charger les progrès
  const { refetch: refetchProgress } = useProgress();

  // ⚡ PERFORMANCE: Mémoriser le callback de succès pour éviter les re-renders
  const handleProgressSuccess = useCallback(() => {
    refetchProgress();
    // Rafraîchir aussi la liste des exercices au cas où un progrès orthophonie a été créé
    refetchExercices();
  }, [refetchProgress, refetchExercices]);

  // Options des onglets
  const tabOptions = useMemo(() => {
    const options: Array<{ value: TabValue; label: string; icon?: ReactNode }> = [];
    
    options.push({ 
      value: 'corps', 
      label: 'Corps',
      icon: <UserIcon className="w-5 h-5" />
    });
    
    if (isAphasic) {
      options.push({ 
        value: 'aphasie', 
        label: 'Aphasie',
        icon: <ChatIcon className="w-5 h-5" />
      });
    }
    
    options.push({ 
      value: 'parcours', 
      label: 'Parcours',
      icon: <MapIcon className="w-5 h-5" />
    });
    
    return options;
  }, [isAphasic]);

  // Si l'onglet actif n'est plus disponible, changer vers 'corps'
  const currentActiveTab = useMemo(() => {
    const isTabAvailable = tabOptions.some(opt => opt.value === activeTab);
    return isTabAvailable ? activeTab : 'corps';
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
                {currentActiveTab === 'corps' && (
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
                            />
                          </MotionDiv>
                        );
                      })}
                    {/* Action secondaire : Voir par équipement */}
                    <MenuLink
                      title="Voir par équipement"
                      icon="🏋️‍♂️"
                      description="Explorer tous les exercices par équipement"
                      href="/exercices/equipments"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isSecondary={true}
                    />
                    </div>


                  
                  </div>
                )}

              {currentActiveTab === 'aphasie' && isAphasic && (
                <SiteMapGroup
                  title="Journal d'aphasie"
                  icon={<ChatIcon className="w-5 h-5" />}
                  description="Mes exercices et mes citations"
                  href="/aphasie"
                  iconBgColor={SITEMAP_ICON_STYLES.primary.aphasie.bg}
                  iconTextColor={SITEMAP_ICON_STYLES.primary.aphasie.text}
                >
                  <MenuLink
                    title="Exercices ortho"
                    icon={<PinIcon className="w-5 h-5" />}
                    description="Voir mes exercices"
                    href="/aphasie/exercices"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                  />
                  <MenuLink
                    title="Mes citations"
                    icon={<BookIcon className="w-5 h-5" />}
                    description="Voir toutes"
                    href="/aphasie/citations"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                  />
                </SiteMapGroup>
              )}

              {currentActiveTab === 'parcours' && (
                <div className="space-y-3">
                  <MenuLink
                    title="Voir mes progrès"
                    icon={<SparklesIcon className="w-5 h-5" />}
                    description="Timeline et graphique de progression"
                    href="/historique#progres"
                    iconBgColor={MENU_COLORS.PROGRES.bg}
                    iconTextColor={MENU_COLORS.PROGRES.text}
                  />
                  <MenuLink
                    title="Voir mes Statistiques"
                    icon={<MapIcon className="w-5 h-5" />}
                    description="Heatmap, graphique montagne et zones travaillées"
                    href="/historique#statistiques"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
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
        />
      )}


    </section>
  );
}
