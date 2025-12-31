'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { EmptyState, CreateUserCard, Loader, VictoryFAB, VictoryBottomSheet, CategoryCardWithProgress, ViewVictoriesButton } from '@/app/components';
import { VictoryCard } from '@/app/components/historique';
import type { Victory } from '@/app/types';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useCategoryStats } from '@/app/hooks/useCategoryStats';

export default function Home() {
  const pathname = usePathname();
  const { currentUser, users, loading: userLoading } = useUser();
  const [lastVictory, setLastVictory] = useState<Victory | null>(null);
  const victoryModal = useVictoryModal();
  
  const { exercices, loading: loadingExercices } = useExercices({
    userId: userLoading ? undefined : currentUser?.id,
  });

  // Charger les stats de progression par catégorie
  const { stats: categoryStats, loading: loadingStats } = useCategoryStats({
    userId: currentUser?.id ?? null,
    resetFrequency: currentUser?.resetFrequency || 'DAILY',
  });

  const fetchLastVictory = useCallback(() => {
    if (!currentUser) return;

    fetch(`/api/victories?userId=${currentUser.id}&limit=1`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLastVictory(data[0]);
        } else {
          setLastVictory(null);
        }
      })
      .catch(error => {
        console.error('Fetch victory error:', error);
        setLastVictory(null);
      });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchLastVictory();
    }
  }, [currentUser, fetchLastVictory]);

  // Période affichée
  const periodLabel = currentUser?.resetFrequency === 'WEEKLY' ? 'cette semaine' : "aujourd'hui";

  return (
    <section>
      <div className="max-w-5xl mx-auto">
        {/* Contenu principal */}
        <div className="px-3 md:px-4">
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
              {/* Titre de la section */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Ma progression {periodLabel}
                </h2>
              </div>

              {/* Cartes de catégories avec progression intégrée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {CATEGORY_ORDER.map(category => {
                  const categoryExercices = exercices.filter(e => e.category === category);
                  if (categoryExercices.length === 0) return null;

                  return (
                    <CategoryCardWithProgress
                      key={category}
                      category={category}
                      exercices={exercices}
                      completedCount={categoryStats[category]}
                    />
                  );
                }).filter(Boolean)}
              </div>

              {/* Section dernière victoire */}
              {lastVictory && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      🌟 Ma dernière réussite
                    </h2>
                  </div>
                  <VictoryCard 
                    victory={lastVictory} 
                    onEdit={victoryModal.openForEdit}
                  />
                </section>
              )}

              {/* Bouton "Voir mes réussites" */}
              <ViewVictoriesButton />

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
          onSuccess={fetchLastVictory}
          userId={currentUser.id}
          victoryToEdit={victoryModal.victoryToEdit}
        />
      )}
    </section>
  );
}
