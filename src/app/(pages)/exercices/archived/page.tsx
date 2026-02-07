'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExerciceCard } from '@/app/components/ExerciceCard';
import { EmptyState } from '@/app/components/EmptyState';
import { AddButton } from '@/app/components/ui';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { 
  CATEGORY_LABELS,
  CATEGORY_ORDER, 
  CATEGORY_ICONS,
} from '@/app/constants/exercice.constants';
import { useExercices } from '@/app/hooks/useExercices';
import { useExerciceHandlers } from '@/app/hooks/useExerciceHandlers';
import type { Exercice, ExerciceCategory } from '@/app/types/exercice';

export default function ArchivedPage() {
  // Charger tous les exercices (y compris archivés)
  const { exercices, loading: loadingExercices, updateExercice } = useExercices({ includeArchived: true });

  // Filtrer pour ne garder que les exercices archivés
  const archivedExercices = useMemo(() => {
    return exercices.filter(ex => ex.archived === true);
  }, [exercices]);

  const { handleEditClick, handleCompleted } = useExerciceHandlers({
    updateExercice,
    fromPath: '/exercices/archived',
  });

  const handleArchive = (updatedExercice: Exercice) => {
    updateExercice(updatedExercice);
  };

  // Grouper par catégorie
  const exercicesByCategory = useMemo(() => {
    const grouped: Record<ExerciceCategory, Exercice[]> = {
      UPPER_BODY: [],
      LOWER_BODY: [],
      CORE: [],
      STRETCHING: [],
    };
    
    archivedExercices.forEach(ex => {
      grouped[ex.category].push(ex);
    });
    
    return grouped;
  }, [archivedExercices]);

  return (
    <section className="pb-12 md:pb-8 min-h-screen">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header */}
        <div className="px-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Exercices archivés
            </h1>
            {loadingExercices ? (
              <p className="text-gray-500 mt-1">
                <span className="inline-block h-5 w-48 bg-gray-200 rounded animate-pulse" />
              </p>
            ) : (
              <p className="text-gray-500 mt-1">
                {archivedExercices.length} exercice{archivedExercices.length > 1 ? 's' : ''} archivé{archivedExercices.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Exercices */}
        <div className="px-4">
          {loadingExercices ? (
            <div className="flex items-center justify-center min-h-screen py-12">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : archivedExercices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <EmptyState
                icon={NAVIGATION_EMOJIS.FOLDER_CLOSED}
                title="Aucun exercice archivé"
                message="Les exercices que vous archivez apparaîtront ici. Vous pourrez les désarchiver à tout moment."
              />
            </motion.div>
          ) : (
            <div className="space-y-10 md:space-y-8">
              {CATEGORY_ORDER.map((category) => {
                const categoryExercices = exercicesByCategory[category];
                const categoryIcon = CATEGORY_ICONS[category];
                const hasExercices = categoryExercices.length > 0;

                if (!hasExercices) {
                  return null;
                }

                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4 md:mb-4">
                      <h2 className="text-lg font-semibold text-gray-800 mb-1 mt-8 flex items-center gap-2">
                        <span>{categoryIcon}</span>
                        <span>{CATEGORY_LABELS[category]}</span>
                      </h2>
                      <p className="text-sm text-gray-500">
                        {categoryExercices.length} exercice{categoryExercices.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                      {categoryExercices.map((exercice) => (
                        <div key={exercice.id} className="h-full">
                          <ExerciceCard
                            exercice={exercice}
                            onEdit={handleEditClick}
                            onCompleted={handleCompleted}
                            onArchive={handleArchive}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bouton "Ajouter un exercice" - centré en bas de page */}
      <div className="flex justify-center mt-8 mb-6">
        <AddButton 
          href="/exercice/add" 
          label="Ajouter un exercice"
          addFromParam
        />
      </div>
    </section>
  );
}
