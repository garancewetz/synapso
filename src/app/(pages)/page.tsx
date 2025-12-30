'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { EmptyState, CreateUserCard, CategoryCard, Loader, ProgressGauges, SparklesIcon, VictoryFAB, VictoryBottomSheet } from '@/app/components';
import { VictoryCard } from '@/app/components/historique';
import type { Victory } from '@/app/types';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';

export default function Home() {
  const pathname = usePathname();
  const { currentUser, users, loading: userLoading } = useUser();
  const [lastVictory, setLastVictory] = useState<Victory | null>(null);
  const victoryModal = useVictoryModal();
  
  const { exercices, loading: loadingExercices } = useExercices({
    userId: userLoading ? undefined : currentUser?.id,
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

  return (
    <section>
      <div className="max-w-5xl mx-auto">
        {/* Contenu principal */}
        <div className="px-3 md:px-4">
          {userLoading || (currentUser && loadingExercices) ? (
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
              {/* Cartes de catégories avec jauges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {CATEGORY_ORDER.map(category => {
                  const categoryExercices = exercices.filter(e => e.category === category);
                  if (categoryExercices.length === 0) return null;

                  return (
                    <CategoryCard
                      key={category}
                      category={category}
                      exercices={exercices}
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

              {/* Section progression par catégorie */}
              {currentUser && (
                <ProgressGauges
                  userId={currentUser.id}
                  exercices={exercices}
                  resetFrequency={currentUser.resetFrequency || 'DAILY'}
                />
              )}

              {/* Bouton "Voir mes réussites" */}
              <div className="flex justify-center mt-8 pt-4">
                <Link
                  href="/historique"
                  className="max-w-md py-4 px-6 rounded-full font-bold text-amber-950 
                             bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 
                             shadow-[0_4px_10px_rgba(217,119,6,0.3)] 
                             hover:scale-[1.02] hover:shadow-[0_6px_14px_rgba(217,119,6,0.4)]
                             transition-all flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Mes réussites
                </Link>
              </div>

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
