'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ExerciceCard, EmptyState, CreateUserCard, CategoryCard, Loader, ProgressGauges, PinIcon, SparklesIcon, VictoryFAB } from '@/app/components';
import type { Exercice } from '@/app/types';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, users, loading: userLoading } = useUser();
  
  // Ne charger les exercices que si le user est chargé et disponible
  const { exercices, loading: loadingExercices, updateExercice } = useExercices({
    userId: userLoading ? undefined : currentUser?.id,
  });

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}?from=${encodeURIComponent(pathname)}`);
  };

  const handleCompleted = (updatedExercice: Exercice) => {
    updateExercice(updatedExercice);
  };

  const pinned = exercices.filter(e => e.pinned && !e.completed);

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

              {/* Section des exercices épinglés */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <PinIcon filled={true} className="w-4 h-4 text-red-500" />
                    Mes priorités à faire
                  </h2>
                </div>
                {pinned.length > 0 ? (
                  <div className="grid gap-2.5 md:gap-3 grid-cols-1 lg:grid-cols-2">
                    {pinned.map((exercice) => (
                      <ExerciceCard
                        key={exercice.id}
                        exercice={exercice}
                        onEdit={handleEditClick}
                        onCompleted={handleCompleted}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Pas d&apos;exercice épinglé en attente
                  </p>
                )}
              </section>

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
                  className=" max-w-md py-4 px-6 rounded-full font-bold text-amber-950 
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
    </section>
  );
}
