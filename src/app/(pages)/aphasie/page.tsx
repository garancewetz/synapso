'use client';

import { useState, useEffect, useCallback } from 'react';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import AphasieSectionHeader from '@/app/components/AphasieSectionHeader';
import AphasieItemCard from '@/app/components/AphasieItemCard';
import AphasieChallengesList from '@/app/components/AphasieChallengesList';
import BackToHomeButton from '@/app/components/BackToHomeButton';
import ViewVictoriesButton from '@/app/components/ViewVictoriesButton';
import { VictoryFAB, VictoryBottomSheet } from '@/app/components';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';
import { useAphasieItems } from '@/app/hooks/useAphasieItems';
import { useUser } from '@/app/contexts/UserContext';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';

export const dynamic = 'force-dynamic';

export default function AphasiePage() {
  const { hasAccess } = useAphasieCheck();
  const { items } = useAphasieItems();
  const { currentUser } = useUser();
  const victoryModal = useVictoryModal();
  const [showConfetti, setShowConfetti] = useState(false);

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Handler pour le succès d'une victoire avec confettis dorés
  const handleVictorySuccess = useCallback(() => {
    setShowConfetti(true);
  }, []);

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour accueil */}
      <BackToHomeButton />

      <div className="px-3 sm:p-6">
        <div className="space-y-6">
          {/* Section Exercices */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <AphasieSectionHeader
              title="Exercices"
              emoji="🎯"
              addHref="/aphasie/challenges/add"
              addLabel="Ajouter un exercice"
            />
            <AphasieChallengesList limit={3} />
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

          {/* Bouton "Mes réussites" */}
          <div>
            <ViewVictoriesButton />
          </div>
        </div>
      </div>

      {/* Bouton flottant "Noter une victoire" avec catégorie orthophonie par défaut */}
      {currentUser && <VictoryFAB onSuccess={handleVictorySuccess} defaultCategory="ORTHOPHONIE" />}

      {/* Modal de victoire avec catégorie orthophonie par défaut */}
      {currentUser && (
        <VictoryBottomSheet
          isOpen={victoryModal.isOpen}
          onClose={victoryModal.close}
          onSuccess={handleVictorySuccess}
          userId={currentUser.id}
          victoryToEdit={victoryModal.victoryToEdit}
          defaultCategory={victoryModal.victoryToEdit ? undefined : 'ORTHOPHONIE'}
        />
      )}
    </div>
  );
}