'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExerciceCard } from '@/app/components/ExerciceCard';
import { EmptyState } from '@/app/components/EmptyState';
import { SegmentedControl } from '@/app/components/ui';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { AddButton } from '@/app/components/ui/AddButton';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { ProgressFAB } from '@/app/components';
import clsx from 'clsx';

type FilterType = 'all' | 'notCompleted' | 'completed';

export default function CategoryPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { effectiveUser } = useUser();

  // Convertir le paramètre URL en catégorie
  const categoryParam = (params.category as string)?.toUpperCase() as ExerciceCategory;
  const isValidCategory = CATEGORY_ORDER.includes(categoryParam);

  // Ne charger les exercices que si le user est chargé et disponible
  const { exercices, loading: loadingExercices, updateExercice, refetch } = useExercices({
    category: isValidCategory ? categoryParam : undefined,
  });

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

  // Calculer les counts pour chaque état
  const filterOptionsWithCounts = useMemo(() => {
    const allCount = exercices.length;
    const notCompletedCount = exercices.filter(e => !e.completed).length;
    const completedCount = exercices.filter(e => e.completed).length;

    return [
      { value: 'all' as FilterType, label: 'Tous', count: allCount },
      { value: 'notCompleted' as FilterType, label: 'À faire', count: notCompletedCount },
      { value: 'completed' as FilterType, label: 'Faits', count: completedCount },
    ];
  }, [exercices]);

  if (!isValidCategory) {
    return null;
  }

  return (
    <section className="pb-40 md:pb-8">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header - toujours visible */}
        <div className="px-4 mb-6">
          <div className={clsx(
            'flex items-start gap-3',
            effectiveUser?.dominantHand === 'LEFT' 
              ? 'justify-start md:justify-between' 
              : 'justify-between',
            'md:justify-between'
          )}>
            {effectiveUser?.dominantHand === 'LEFT' ? (
              <>
                <AddButton 
                  href="/exercice/add" 
                  label="Ajouter un exercice"
                  queryParams={{ category: categoryParam.toLowerCase() }}
                  addFromParam
                  className="md:order-last shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {CATEGORY_LABELS[categoryParam]}
                  </h1>
                  {loadingExercices ? (
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : exercices.length > 0 ? (
                    <p className="text-gray-500 mt-1">
                      {completedCount}/{exercices.length} exercices complétés
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {CATEGORY_LABELS[categoryParam]}
                  </h1>
                  {loadingExercices ? (
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mt-1" />
                  ) : exercices.length > 0 ? (
                    <p className="text-gray-500 mt-1">
                      {completedCount}/{exercices.length} exercices complétés
                    </p>
                  ) : null}
                </div>
                <AddButton 
                  href="/exercice/add" 
                  label="Ajouter un exercice"
                  queryParams={{ category: categoryParam.toLowerCase() }}
                  addFromParam
                  className="shrink-0"
                />
              </>
            )}
          </div>
          
          {/* Filtre - toujours visible */}
          <div className="mt-4">
            <SegmentedControl
              options={filterOptionsWithCounts}
              value={filter}
              onChange={setFilter}
              fullWidth
              size="md"
              variant="filter"
              showCountBelow
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4">
          {filteredExercices.length === 0 && !loadingExercices ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="grid gap-3 grid-cols-1 lg:grid-cols-2"
            >
              {filteredExercices.map((exercice) => (
                <div key={exercice.id} className="h-full">
                  <ExerciceCard
                    exercice={exercice}
                    onEdit={handleEditClick}
                    onCompleted={handleCompleted}
                  />
                </div>
              ))}
            </motion.div>
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
