'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { EmptyState, Loader, ProgressFAB, ProgressBottomSheet, CategoryCardWithProgress, SiteMapCard, SiteMapGroup } from '@/app/components';
import { ProgressCard } from '@/app/components/historique';
import { SegmentedControl } from '@/app/components/ui';
import { MapIcon, ChatIcon, SettingsIcon, PlusIcon, BookIcon, PinIcon, SparklesIcon, UserIcon } from '@/app/components/ui/icons';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useCategoryStats } from '@/app/hooks/useCategoryStats';
import { useProgress } from '@/app/hooks/useProgress';

type TabValue = 'corps' | 'aphasie' | 'parcours' | 'paramètres';

export default function Home() {
  const pathname = usePathname();
  const { effectiveUser, loading: userLoading } = useUser();
  const progressModal = useProgressModal();
  const isAphasic = effectiveUser?.isAphasic ?? false;
  const [activeTab, setActiveTab] = useState<TabValue>('corps');
  
  const { exercices, loading: loadingExercices, refetch: refetchExercices } = useExercices();

  // Charger les stats de progression par catégorie
  const { stats: categoryStats, loading: loadingStats } = useCategoryStats({
    userId: effectiveUser?.id ?? null,
    resetFrequency: effectiveUser?.resetFrequency || 'DAILY',
  });

  // Charger les progrès (pour le dernier progrès)
  const { lastProgress, refetch: refetchProgress } = useProgress();


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
    options.push({ 
      value: 'paramètres', 
      label: 'Paramètres',
      icon: <SettingsIcon className="w-5 h-5" />
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
        {/* Contenu principal */}
        <div className="px-3 md:px-4 pb-24 md:pb-8">
          {userLoading || (effectiveUser && (loadingExercices || loadingStats)) ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="large" />
            </div>
          ) : !effectiveUser ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="large" />
            </div>
          ) : exercices.length === 0 ? (
            <EmptyState
              icon="+"
              title="Aucun exercice"
              message="Commencez par ajouter votre premier exercice."
              subMessage="Cliquez sur le bouton ci-dessous pour créer un exercice."
              actionHref={`/exercice/add?from=${encodeURIComponent(pathname)}`}
              actionLabel="Créer mon premier exercice"
            />
          ) : (
            <div className="space-y-6">
              {/* Onglets */}
              {tabOptions.length > 0 && (
                <div>
                  <SegmentedControl
                    options={tabOptions}
                    value={currentActiveTab}
                    onChange={setActiveTab}
                    fullWidth
                    size="md"
                  />
                </div>
              )}

              {/* Contenu selon l'onglet actif */}
              {currentActiveTab === 'corps' && (
                <div className="space-y-4">
                  {/* Cartes de catégories avec progression intégrée */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {CATEGORY_ORDER.map(category => {
                      const categoryExercices = exercices.filter(e => e.category === category);
                      if (categoryExercices.length === 0) return null;

                      return (
                        <CategoryCardWithProgress
                          key={category}
                          category={category}
                          total={categoryExercices.length}
                          completedCount={categoryStats[category]}
                        />
                      );
                    }).filter(Boolean)}
                  </div>

                  {/* Action secondaire : Ajouter un exercice */}
                  <SiteMapCard
                    title="Ajouter un exercice"
                    icon={<PlusIcon className="w-5 h-5" />}
                    description="Créer un nouvel exercice personnalisé"
                    href="/exercice/add"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.addExercice.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.addExercice.text}
                    isSecondary={true}
                  />
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
                  <SiteMapCard
                    title="Exercices ortho"
                    icon={<PinIcon className="w-5 h-5" />}
                    description="Voir mes exercices"
                    href="/aphasie/exercices"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                  />
                  <SiteMapCard
                    title="Ajouter exercice"
                    icon={<PlusIcon className="w-5 h-5" />}
                    description="Créer un exercice"
                    href="/aphasie/exercices/add"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                    isSecondary={true}
                  />
                  <SiteMapCard
                    title="Mes citations"
                    icon={<BookIcon className="w-5 h-5" />}
                    description="Voir toutes"
                    href="/aphasie/citations"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                  />
                  <SiteMapCard
                    title="Ajouter citation"
                    icon={<PlusIcon className="w-5 h-5" />}
                    description="Créer une nouvelle"
                    href="/aphasie/add"
                    iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.default.text}
                    isSecondary={true}
                  />
                </SiteMapGroup>
              )}

              {currentActiveTab === 'parcours' && (
                <div className="space-y-3">
                  <SiteMapGroup
                    title="Mon parcours"
                    icon={<MapIcon className="w-5 h-5" />}
                    description="Voir mon historique et mes statistiques"
                    href="/historique"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
                  >
                    <SiteMapCard
                      title="Chemin parcouru"
                      icon={<MapIcon className="w-5 h-5" />}
                      description="40 derniers jours"
                      href="/historique/roadmap"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                    />
                    <SiteMapCard
                      title="Mes réussites"
                      icon={<SparklesIcon className="w-5 h-5" />}
                      description="Toutes mes victoires"
                      href="/historique/victories"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                    />
                  </SiteMapGroup>

                  <SiteMapCard
                    title="Noter une réussite"
                    icon={<SparklesIcon className="w-5 h-5" />}
                    description="Célébrez un moment important de votre parcours"
                    onClick={() => progressModal.openForCreate()}
                    iconBgColor={SITEMAP_ICON_STYLES.primary.victory.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.victory.text}
                  />
                  
                  {/* Section dernier progrès */}
                  {lastProgress && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span>{PROGRESS_EMOJIS.STAR_BRIGHT}</span> Mon dernier progrès
                        </h2>
                      </div>
                      <ProgressCard 
                        progress={lastProgress} 
                        onEdit={progressModal.openForEdit}
                      />
                    </div>
                  )}
                </div>
              )}

              {currentActiveTab === 'paramètres' && (
                <div className="space-y-3">
                  <SiteMapCard
                    title="Mon profil"
                    icon={<UserIcon className="w-5 h-5" />}
                    description="Modifier mes réglages"
                    href="/settings"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.settings.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.settings.text}
                  />
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Bouton flottant "Noter un progrès" - visible sur toutes les pages */}
      {effectiveUser && exercices.length > 0 && <ProgressFAB />}

      {/* Modal d'édition de progrès */}
      {effectiveUser && (
        <ProgressBottomSheet
          isOpen={progressModal.isOpen}
          onClose={progressModal.close}
          onSuccess={() => {
            refetchProgress();
            // Rafraîchir aussi la liste des exercices au cas où un progrès orthophonie a été créé
            refetchExercices();
          }}
          userId={effectiveUser.id}
          progressToEdit={progressModal.progressToEdit}
        />
      )}

    </section>
  );
}
