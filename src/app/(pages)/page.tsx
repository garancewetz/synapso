'use client';

import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { EmptyState, CreateUserCard, Loader, VictoryFAB, VictoryBottomSheet, CategoryCardWithProgress, SiteMapCard } from '@/app/components';
import { VictoryCard, WeekHeatmap, DayDetailModal } from '@/app/components/historique';
import { SegmentedControl } from '@/app/components/ui';
import { MapIcon, ChatIcon, SettingsIcon, PlusIcon, BookIcon, PinIcon, SparklesIcon, UserIcon } from '@/app/components/ui/icons';
import type { HeatmapDay } from '@/app/utils/historique.utils';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useCategoryStats } from '@/app/hooks/useCategoryStats';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { getCurrentWeekData, getLast7DaysData } from '@/app/utils/historique.utils';

type TabValue = 'corps' | 'aphasie' | 'parcours' | 'paramètres';

export default function Home() {
  const pathname = usePathname();
  const { currentUser, users, loading: userLoading } = useUser();
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const victoryModal = useVictoryModal();
  const isAphasic = currentUser?.isAphasic ?? false;
  const [activeTab, setActiveTab] = useState<TabValue>('corps');
  
  const { exercices, loading: loadingExercices, refetch: refetchExercices } = useExercices({
    userId: userLoading ? undefined : currentUser?.id,
  });

  // Charger les stats de progression par catégorie
  const { stats: categoryStats, loading: loadingStats } = useCategoryStats({
    userId: currentUser?.id ?? null,
    resetFrequency: currentUser?.resetFrequency || 'DAILY',
  });

  // Charger l'historique
  const { history } = useHistory();

  // Charger les victoires (pour le calendrier et la dernière victoire)
  const { victories, lastVictory, refetch: refetchVictories } = useVictories();

  // Données selon le rythme de l'utilisateur
  const weekData = useMemo(() => {
    const resetFrequency = currentUser?.resetFrequency || 'DAILY';
    return resetFrequency === 'WEEKLY' 
      ? getCurrentWeekData(history)
      : getLast7DaysData(history);
  }, [history, currentUser?.resetFrequency]);

  // Dates des victoires pour le calendrier
  const victoryDates = useMemo(() => {
    return new Set(victories.map(v => v.createdAt.split('T')[0]));
  }, [victories]);

  // Gestion du clic sur une journée du calendrier
  const handleDayClick = useCallback((day: HeatmapDay) => {
    setSelectedDay(day);
  }, []);

  // Exercices du jour sélectionné
  const selectedDayExercises = useMemo(() => {
    if (!selectedDay?.dateKey) return [];
    return history
      .filter(entry => entry.completedAt.split('T')[0] === selectedDay.dateKey)
      .map(entry => ({
        name: entry.exercice.name,
        category: entry.exercice.category!,
        completedAt: entry.completedAt,
      }));
  }, [selectedDay, history]);

  // Victoire du jour sélectionné
  const selectedDayVictory = useMemo(() => {
    if (!selectedDay?.dateKey) return null;
    return victories.find(v => v.createdAt.split('T')[0] === selectedDay.dateKey) || null;
  }, [selectedDay, victories]);

  // Période affichée
  const periodLabel = currentUser?.resetFrequency === 'WEEKLY' ? 'cette semaine' : 'des derniers jours';

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
          {userLoading || (currentUser && (loadingExercices || loadingStats)) ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="large" />
            </div>
          ) : users.length === 0 ? (
            <div className="max-w-md mx-auto py-8">
              <CreateUserCard />
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
              {/* Progression de la semaine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" /> Ma progression {periodLabel}
                  </h2>
                </div>
                <WeekHeatmap 
                  weekData={weekData}
                  victoryDates={victoryDates}
                  onDayClick={handleDayClick}
                  resetFrequency={currentUser?.resetFrequency || 'DAILY'}
                />
              </div>

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
                <div className="space-y-3">
                  <SiteMapCard
                    title="Journal d'aphasie"
                    icon={<ChatIcon className="w-5 h-5" />}
                    description="Mes citations et mes exercices"
                    href="/aphasie"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.aphasie.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.aphasie.text}
                  />
                  <div className="ml-6 md:ml-8 space-y-2">
                    <SiteMapCard
                      title="Mes citations"
                      icon={<BookIcon className="w-5 h-5" />}
                      description="Voir toutes mes citations"
                      href="/aphasie/citations"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isChild={true}
                    />
                    <SiteMapCard
                      title="Ajouter une citation"
                      icon={<PlusIcon className="w-5 h-5" />}
                      description="Créer une nouvelle citation"
                      href="/aphasie/add"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isChild={true}
                      isSecondary={true}
                    />
                    <SiteMapCard
                      title="Mes exercices ortho"
                      icon={<PinIcon className="w-5 h-5" />}
                      description="Voir mes exercices ortho"
                      href="/aphasie/exercices"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isChild={true}
                    />
                    <SiteMapCard
                      title="Ajouter exercice ortho"
                      icon={<PlusIcon className="w-5 h-5" />}
                      description="Créer un exercice ortho"
                      href="/aphasie/exercices/add"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isChild={true}
                      isSecondary={true}
                    />
                  </div>
                </div>
              )}

              {currentActiveTab === 'parcours' && (
                <div className="space-y-3">
                  <SiteMapCard
                    title="Mon parcours"
                    icon={<MapIcon className="w-5 h-5" />}
                    description="Voir mon historique et mes statistiques"
                    href="/historique"
                    iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
                  />
                  <div className="ml-6 md:ml-8 space-y-2">
                    <SiteMapCard
                      title="Mon chemin parcouru"
                      icon={<MapIcon className="w-5 h-5" />}
                      description="Voir les 40 derniers jours de mon parcours"
                      href="/historique/roadmap"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isChild={true}
                    />
                    <SiteMapCard
                      title="Mes réussites"
                      icon={<SparklesIcon className="w-5 h-5" />}
                      description="Voir toutes mes victoires"
                      href="/historique/victories"
                      iconBgColor={SITEMAP_ICON_STYLES.default.bg}
                      iconTextColor={SITEMAP_ICON_STYLES.default.text}
                      isChild={true}
                    />
                  </div>
                  <SiteMapCard
                    title="Noter une réussite"
                    icon={<SparklesIcon className="w-5 h-5" />}
                    description="Célébrez un moment important de votre parcours"
                    onClick={() => victoryModal.openForCreate()}
                    iconBgColor={SITEMAP_ICON_STYLES.primary.victory.bg}
                    iconTextColor={SITEMAP_ICON_STYLES.primary.victory.text}
                  />
                  
                  {/* Section dernière victoire */}
                  {lastVictory && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <SparklesIcon className="w-5 h-5" /> Ma dernière réussite
                        </h2>
                      </div>
                      <VictoryCard 
                        victory={lastVictory} 
                        onEdit={victoryModal.openForEdit}
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

      {/* Bouton flottant "Noter une victoire" - visible sur toutes les pages */}
      {currentUser && exercices.length > 0 && <VictoryFAB />}

      {/* Modal d'édition de victoire */}
      {currentUser && (
        <VictoryBottomSheet
          isOpen={victoryModal.isOpen}
          onClose={victoryModal.close}
          onSuccess={() => {
            refetchVictories();
            // Rafraîchir aussi la liste des exercices au cas où une victoire orthophonie a été créée
            refetchExercices();
          }}
          userId={currentUser.id}
          victoryToEdit={victoryModal.victoryToEdit}
        />
      )}

      {/* Modal détail d'une journée */}
      <DayDetailModal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        date={selectedDay?.date || null}
        exercises={selectedDayExercises}
        victory={selectedDayVictory}
        onEdit={victoryModal.openForEdit}
      />
    </section>
  );
}
