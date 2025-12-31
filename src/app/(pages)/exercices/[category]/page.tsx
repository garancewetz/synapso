'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import ExerciceCard from '@/app/components/ExerciceCard';
import EmptyState from '@/app/components/EmptyState';
import { Loader, SegmentedControl } from '@/app/components/ui';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { BookmarkIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import AddExerciceButton from '@/app/components/AddExerciceButton';
import { VictoryFAB, ViewVictoriesButton } from '@/app/components';

type FilterType = 'all' | 'notCompleted' | 'completed';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'notCompleted', label: 'À faire' },
  { value: 'completed', label: 'Faits' },
];

export default function CategoryPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { currentUser, loading: userLoading } = useUser();

  // Convertir le paramètre URL en catégorie
  const categoryParam = (params.category as string)?.toUpperCase() as ExerciceCategory;
  const isValidCategory = CATEGORY_ORDER.includes(categoryParam);

  // Ne charger les exercices que si le user est chargé et disponible
  const { exercices, loading: loadingExercices, updateExercice } = useExercices({
    userId: userLoading ? undefined : currentUser?.id,
    category: isValidCategory ? categoryParam : undefined,
  });
  
  const loading = userLoading || loadingExercices;

  useEffect(() => {
    if (!isValidCategory) {
      router.push('/');
    }
  }, [isValidCategory, router]);

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}?from=${encodeURIComponent(pathname)}`);
  };

  const handleCompleted = (updatedExercice: Exercice) => {
    updateExercice(updatedExercice);
  };

  // Filtrer les exercices selon le filtre
  const filteredExercices = filter === 'all'
    ? exercices
    : filter === 'notCompleted'
    ? exercices.filter(e => !e.completed)
    : exercices.filter(e => e.completed);

  // Séparer les exercices épinglés des autres
  const pinned = filteredExercices.filter(e => e.pinned);
  const regular = filteredExercices.filter(e => !e.pinned);
  const completedCount = exercices.filter(e => e.completed).length;

  if (!isValidCategory) {
    return null;
  }

  return (
    <section>
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header */}
        {!userLoading && !loadingExercices && (
          <div className="px-4 mb-6">
            <div className={`flex items-start gap-4 ${currentUser?.dominantHand === 'LEFT' ? 'justify-start md:justify-between' : 'justify-between'} md:justify-between`}>
              {currentUser?.dominantHand === 'LEFT' ? (
                <>
                  <AddExerciceButton category={categoryParam} className="md:order-last" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {CATEGORY_LABELS[categoryParam]}
                    </h1>
                    <p className="text-gray-500 mt-1">
                      {completedCount}/{exercices.length} exercices complétés
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {CATEGORY_LABELS[categoryParam]}
                    </h1>
                    <p className="text-gray-500 mt-1">
                      {completedCount}/{exercices.length} exercices complétés
                    </p>
                  </div>
                  <AddExerciceButton category={categoryParam} />
                </>
              )}
            </div>
            
            {/* Switch à trois parties */}
            <div className="mt-4">
              <SegmentedControl
                options={FILTER_OPTIONS}
                value={filter}
                onChange={setFilter}
                fullWidth
                size="md"
              />
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="px-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="large" />
            </div>
          ) : filteredExercices.length === 0 ? (
            <EmptyState
              icon="📂"
              title={
                filter === 'notCompleted'
                  ? "Tous les exercices sont faits !"
                  : filter === 'completed'
                  ? "Aucun exercice fait"
                  : `Aucun exercice ${CATEGORY_LABELS[categoryParam].toLowerCase()}`
              }
              message={
                filter === 'notCompleted'
                  ? "Félicitations, vous avez complété tous les exercices de cette catégorie."
                  : filter === 'completed'
                  ? "Vous n'avez pas encore complété d'exercices dans cette catégorie."
                  : "Cette catégorie est vide pour le moment."
              }
              subMessage={filter === 'all' ? "Ajoutez des exercices depuis le menu." : undefined}
            />
          ) : (
            <div className="space-y-6">
              {/* Section des exercices épinglés */}
              {pinned.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BookmarkIcon className="w-4 h-4 text-red-500" />
                    Priorités
                  </h2>
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    {pinned.map((exercice) => (
                      <ExerciceCard
                        key={exercice.id}
                        exercice={exercice}
                        onEdit={handleEditClick}
                        onCompleted={handleCompleted}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tous les exercices */}
              {regular.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <h2 className="text-base font-semibold text-gray-800 mb-3">
                      Autres exercices
                    </h2>
                  )}
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    {regular.map((exercice) => (
                      <ExerciceCard
                        key={exercice.id}
                        exercice={exercice}
                        onEdit={handleEditClick}
                        onCompleted={handleCompleted}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bouton "Voir mes réussites" */}
          {!loading && filteredExercices.length > 0 && (
            <ViewVictoriesButton />
          )}
          
      
        </div>
      </div>

      {/* Bouton flottant "Noter une victoire" */}
      <VictoryFAB />
    </section>
  );
}
