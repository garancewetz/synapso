'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import ExerciceCard from '@/app/components/ExerciceCard';
import EmptyState from '@/app/components/EmptyState';
import { Loader, SegmentedControl } from '@/app/components/ui';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import AddButton from '@/app/components/ui/AddButton';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { ProgressFAB, ViewProgressButton } from '@/app/components';

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
  const { effectiveUser, loading: userLoading } = useUser();

  // Convertir le paramètre URL en catégorie
  const categoryParam = (params.category as string)?.toUpperCase() as ExerciceCategory;
  const isValidCategory = CATEGORY_ORDER.includes(categoryParam);

  // Ne charger les exercices que si le user est chargé et disponible
  const { exercices, loading: loadingExercices, updateExercice, refetch } = useExercices({
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

  // Les favoris sont déjà en haut grâce au tri dans l'API
  // (orderBy: [{ pinned: 'desc' }, { id: 'desc' }])
  const completedCount = exercices.filter(e => e.completed).length;

  if (!isValidCategory) {
    return null;
  }

  return (
    <section className="pb-4 md:pb-8">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header */}
        {!userLoading && !loadingExercices && (
          <div className="px-4 mb-6">
            <div className={`flex items-start gap-4 ${effectiveUser?.dominantHand === 'LEFT' ? 'justify-start md:justify-between' : 'justify-between'} md:justify-between`}>
              {effectiveUser?.dominantHand === 'LEFT' ? (
                <>
                  <AddButton 
                    href="/exercice/add" 
                    label="Ajouter un exercice"
                    queryParams={{ category: categoryParam.toLowerCase() }}
                    addFromParam
                    className="md:order-last"
                  />
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
                  <AddButton 
                    href="/exercice/add" 
                    label="Ajouter un exercice"
                    queryParams={{ category: categoryParam.toLowerCase() }}
                    addFromParam
                  />
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
              icon={NAVIGATION_EMOJIS.FOLDER_OPEN}
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
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
              {filteredExercices.map((exercice) => (
                <ExerciceCard
                  key={exercice.id}
                  exercice={exercice}
                  onEdit={handleEditClick}
                  onCompleted={handleCompleted}
                />
              ))}
            </div>
          )}

          {/* Bouton "Voir mes réussites" */}
          {!loading && filteredExercices.length > 0 && (
            <ViewProgressButton />
          )}
          
      
        </div>
      </div>

      {/* Bouton flottant "Noter un progrès" */}
      <ProgressFAB onSuccess={() => {
        // Rafraîchir la liste des exercices au cas où un progrès orthophonie a été créé
        refetch();
      }} />
    </section>
  );
}
