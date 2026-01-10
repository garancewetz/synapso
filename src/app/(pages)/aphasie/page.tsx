'use client';

import { useState, useEffect, useCallback } from 'react';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import AphasieSectionHeader from '@/app/components/AphasieSectionHeader';
import { AphasieItemCard } from '@/app/components/AphasieItemCard';
import AphasieChallengesList from '@/app/components/AphasieChallengesList';
import { BackButton } from '@/app/components/BackButton';
import ViewProgressButton from '@/app/components/ViewProgressButton';
import { ProgressFAB, ProgressBottomSheet } from '@/app/components';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';
import { useAphasieItems } from '@/app/hooks/useAphasieItems';
import { useUser } from '@/app/contexts/UserContext';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useOrthophonieProgress } from '@/app/hooks/useOrthophonieProgress';
import { ProgressTimeline } from '@/app/components/historique';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';

export const dynamic = 'force-dynamic';

export default function AphasiePage() {
  const { hasAccess } = useAphasieCheck();
  const { items } = useAphasieItems();
  const { effectiveUser } = useUser();
  const progressModal = useProgressModal();
  const [showConfetti, setShowConfetti] = useState(false);
  const { progressList: orthoProgress, refetch: refetchProgress } = useOrthophonieProgress(effectiveUser?.id ?? null);

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Handler pour le succès d'un progrès avec confettis dorés
  const handleProgressSuccess = useCallback(() => {
    setShowConfetti(true);
    refetchProgress();
  }, [refetchProgress]);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-4 md:pb-8">
      {/* Bouton retour accueil */}
      <BackButton className="mb-4" buttonClassName="py-3" />

      <div className="px-3 sm:p-6">
        <div className="space-y-6">
          {/* Section Exercices */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <AphasieSectionHeader
              title="Exercices"
              emoji="🎯"
              addHref="/aphasie/exercices/add"
              addLabel="Ajouter un exercice"
            />
            <AphasieChallengesList 
              limit={3} 
              onMasteredChange={refetchProgress}
            />
          </div>

          {/* Section Citations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <AphasieSectionHeader
              title="Citations"
              emoji={CATEGORY_EMOJIS.ORTHOPHONIE}
              addHref="/aphasie/add"
              addLabel="Ajouter une citation"
            />
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Aucune citation pour le moment
              </div>
            ) : (
              <>
                <ul className="space-y-4">
                  {items.slice(0, 3).map(item => (
                    <AphasieItemCard key={item.id} item={item} />
                  ))}
                </ul>
                {items.length > 3 && (
                  <ViewAllLink 
                    href="/aphasie/citations"
                    label="Voir toutes les citations"
                    emoji={CATEGORY_EMOJIS.ORTHOPHONIE}
                  />
                )}
              </>
            )}
          </div>

          {/* Section Progrès */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <AphasieSectionHeader
              title="Mes progrès"
              emoji={PROGRESS_EMOJIS.STAR_BRIGHT}
              addHref="#"
              addLabel=""
              hideAddButton
            />
            <ProgressTimeline 
              progressList={orthoProgress.slice(0, 3)} 
              onEdit={progressModal.openForEdit}
              hideChart
            />
            {orthoProgress.length > 3 && (
              <ViewAllLink 
                href="/historique/victories?filter=orthophonie"
                label="Voir tous les progrès"
                emoji={PROGRESS_EMOJIS.STAR_BRIGHT}
              />
            )}
          </div>

          {/* Bouton "Mon parcours" */}
          <div>
            <ViewProgressButton />
          </div>
        </div>
      </div>

      {/* Bouton flottant "Noter un progrès" avec catégorie orthophonie par défaut */}
      {effectiveUser && <ProgressFAB onSuccess={handleProgressSuccess} defaultCategory="ORTHOPHONIE" />}

      {/* Modal de progrès avec catégorie orthophonie par défaut */}
      {effectiveUser && (
        <ProgressBottomSheet
          isOpen={progressModal.isOpen}
          onClose={progressModal.close}
          onSuccess={handleProgressSuccess}
          userId={effectiveUser.id}
          progressToEdit={progressModal.progressToEdit}
          defaultCategory={progressModal.progressToEdit ? undefined : 'ORTHOPHONIE'}
        />
      )}
    </div>
  );
}