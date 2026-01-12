'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciceCard from '@/app/components/ExerciceCard';
import EmptyState from '@/app/components/EmptyState';
import { SegmentedControl, Loader } from '@/app/components/ui';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import AddButton from '@/app/components/ui/AddButton';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import { ProgressFAB, ViewProgressButton } from '@/app/components';
import clsx from 'clsx';

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
                  {!loadingExercices && exercices.length > 0 ? (
                    <p className="text-gray-500 mt-1">
                      {completedCount}/{exercices.length} exercices complétés
                    </p>
                  ) : (
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mt-1" />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {CATEGORY_LABELS[categoryParam]}
                  </h1>
                  {!loadingExercices && exercices.length > 0 ? (
                    <p className="text-gray-500 mt-1">
                      {completedCount}/{exercices.length} exercices complétés
                    </p>
                  ) : (
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mt-1" />
                  )}
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
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
              fullWidth
              size="md"
              variant="filter"
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4">
          <AnimatePresence mode="wait">
            {loadingExercices ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[400px] gap-4"
              >
                <Loader size="large" />
                <p className="text-gray-600 font-medium">
                  Chargement de tes exercices... 💪
                </p>
              </motion.div>
            ) : filteredExercices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid gap-3 grid-cols-1 lg:grid-cols-2"
              >
                {filteredExercices.map((exercice) => (
                  <div key={exercice.id}>
                    <ExerciceCard
                      exercice={exercice}
                      onEdit={handleEditClick}
                      onCompleted={handleCompleted}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton "Voir mes réussites" */}
          {!loadingExercices && filteredExercices.length > 0 && (
            <div className="mt-6">
              <ViewProgressButton />
            </div>
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
