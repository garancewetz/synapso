'use client';

import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import EmptyState from '@/app/components/molecules/EmptyState';
import CreateUserCard from '@/app/components/molecules/CreateUserCard';
import CategoryCard from '@/app/components/molecules/CategoryCard';
import AddExerciceButton from '@/app/components/atoms/AddExerciceButton';
import Loader from '@/app/components/atoms/Loader';
import type { Exercice } from '@/types';
import { CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { useUser } from '@/contexts/UserContext';
import { useExercices } from '@/hooks/useExercices';
import WeeklyProgressGauges from '@/app/components/molecules/WeeklyProgressGauges';

export default function Home() {
  const router = useRouter();
  const { currentUser, users, loading: userLoading } = useUser();
  const { exercices, loading: loadingExercices, updateExercice, toggleMockComplete } = useExercices({
    userId: currentUser?.id,
  });

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}`);
  };

  const handleCompleted = (updatedExercice: Exercice) => {
    updateExercice(updatedExercice);
  };

  const pinned = exercices.filter(e => e.pinned);

  return (
    <section>
      <div className="max-w-5xl mx-auto">
        {/* Contenu principal */}
        <div className="px-3 md:px-4">
          {loadingExercices || userLoading ? (
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
              actionHref="/exercice/add"
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

              {/* Section "Fait cette semaine" pour le mode WEEKLY */}
              {currentUser?.resetFrequency === 'WEEKLY' && currentUser && (
                <WeeklyProgressGauges userId={currentUser.id} exercices={exercices} />
              )}

              {/* Section des exercices épinglés */}
              {pinned.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Mes priorités
                    </h2>
                    <AddExerciceButton />
                  </div>
                  <div className="grid gap-2.5 md:gap-3 grid-cols-1 lg:grid-cols-2">
                    {pinned.map((exercice) => (
                      <div key={exercice.id} onClick={() => toggleMockComplete(exercice.id)}>
                        <ExerciceCard
                          exercice={exercice}
                          onEdit={handleEditClick}
                          onCompleted={handleCompleted}
                          showCategory={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

     
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
