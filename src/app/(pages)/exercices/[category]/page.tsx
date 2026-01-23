'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExerciceCard } from '@/app/components/ExerciceCard';
import { EmptyState } from '@/app/components/EmptyState';
import { FilterBadge, StatusFilterSection } from '@/app/components/ui';
import type { ExerciceCategory, ExerciceStatusFilter, Exercice } from '@/app/types/exercice';
import { 
  CATEGORY_LABELS, 
  CATEGORY_ORDER,
  BODYPART_TO_CATEGORY,
  BODYPART_ICONS,
  AVAILABLE_BODYPARTS
} from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { AddButton } from '@/app/components/ui/AddButton';
import { useExercices } from '@/app/hooks/useExercices';
import { useExerciceStatusFilter } from '@/app/hooks/useExerciceStatusFilter';
import { useExerciceHandlers } from '@/app/hooks/useExerciceHandlers';

export default function CategoryPage() {
  const [filter, setFilter] = useState<ExerciceStatusFilter>('all');
  const [selectedBodyparts, setSelectedBodyparts] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();

  // Convertir le paramètre URL en catégorie
  const categoryParam = (params.category as string)?.toUpperCase() as ExerciceCategory;
  const isValidCategory = CATEGORY_ORDER.includes(categoryParam);

  // Ne charger les exercices que si le user est chargé et disponible
  const { exercices, loading: loadingExercices, updateExercice } = useExercices({
    category: isValidCategory ? categoryParam : undefined,
  });

  // Charger aussi les exercices d'étirement pour la section "Étirements liés"
  const { exercices: stretchingExercices, updateExercice: updateStretchingExercice } = useExercices({
    category: categoryParam !== 'STRETCHING' ? 'STRETCHING' : undefined,
  });

  useEffect(() => {
    if (!isValidCategory) {
      router.push('/');
    }
  }, [isValidCategory, router]);

  // Utiliser les hooks partagés
  const { filteredExercices: baseFilteredExercices, completedCount } = useExerciceStatusFilter({
    exercices,
    filter,
  });

  // Créer un handler de complétion qui met à jour les deux listes
  const handleCompleted = useCallback((updatedExercice: Exercice) => {
    // Mettre à jour la liste principale
    updateExercice(updatedExercice);
    
    // Si c'est un étirement, mettre à jour aussi la liste des étirements
    if (updatedExercice.category === 'STRETCHING') {
      updateStretchingExercice(updatedExercice);
    }
  }, [updateExercice, updateStretchingExercice]);

  const { handleEditClick } = useExerciceHandlers({
    updateExercice,
  });

  // Calculer les bodyparts disponibles pour cette catégorie avec leurs compteurs
  const bodypartsWithCounts = useMemo(() => {
    // Pour STRETCHING, on prend tous les bodyparts présents dans les exercices
    // Pour les autres catégories, on filtre par BODYPART_TO_CATEGORY
    const isStretching = categoryParam === 'STRETCHING';

    // Compter les exercices par bodypart
    const counts: Record<string, number> = {};
    exercices.forEach(ex => {
      ex.bodyparts.forEach(bp => {
        if (isStretching || BODYPART_TO_CATEGORY[bp] === categoryParam) {
          counts[bp] = (counts[bp] || 0) + 1;
        }
      });
    });

    // Retourner uniquement les bodyparts qui ont au moins un exercice
    const bodypartsToShow = isStretching
      ? AVAILABLE_BODYPARTS.filter(bp => counts[bp] > 0)
      : AVAILABLE_BODYPARTS.filter(bp => BODYPART_TO_CATEGORY[bp] === categoryParam && counts[bp] > 0);

    return bodypartsToShow
      .map(bp => ({
        value: bp,
        label: bp,
        icon: BODYPART_ICONS[bp] || '',
        count: counts[bp],
      }))
      .sort((a, b) => b.count - a.count); // Trier par nombre décroissant
  }, [exercices, categoryParam]);

  // Filtrer les exercices selon les bodyparts sélectionnés
  const filteredExercices = useMemo(() => {
    if (selectedBodyparts.length === 0) {
      return baseFilteredExercices;
    }

    // Filtrer par bodyparts si sélectionnés (l'exercice doit cibler au moins un des bodyparts sélectionnés)
    return baseFilteredExercices.filter(e => 
      e.bodyparts.some(bp => selectedBodyparts.includes(bp))
    );
  }, [baseFilteredExercices, selectedBodyparts]);

  // Calculer les exercices d'étirement liés (qui ciblent les mêmes bodyparts que la catégorie actuelle)
  const relatedStretchingExercices = useMemo(() => {
    if (categoryParam === 'STRETCHING' || !stretchingExercices.length) {
      return [];
    }

    // Obtenir les bodyparts de cette catégorie
    const categoryBodyparts = AVAILABLE_BODYPARTS.filter(
      bp => BODYPART_TO_CATEGORY[bp] === categoryParam
    );

    // Filtrer les étirements qui ciblent au moins un bodypart de cette catégorie
    let filtered = stretchingExercices.filter(ex =>
      ex.bodyparts.some(bp => categoryBodyparts.includes(bp as typeof AVAILABLE_BODYPARTS[number]))
    );

    // Filtrer par état (comme pour les exercices principaux)
    if (filter === 'notCompleted') {
      filtered = filtered.filter(e => !e.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(e => e.completed);
    }

    // Filtrer par bodyparts si sélectionnés (l'étirement doit cibler au moins un des bodyparts sélectionnés)
    if (selectedBodyparts.length > 0) {
      filtered = filtered.filter(ex =>
        ex.bodyparts.some(bp => selectedBodyparts.includes(bp))
      );
    }

    return filtered;
  }, [categoryParam, stretchingExercices, selectedBodyparts, filter]);

  // Vérifier si le badge "Tous" est actif (aucun bodypart sélectionné)
  const isAllBodypartsSelected = useMemo(() => {
    return selectedBodyparts.length === 0;
  }, [selectedBodyparts.length]);

  // Fonction pour réinitialiser les bodyparts (sélectionner "Tous")
  const handleSelectAllBodyparts = () => {
    setSelectedBodyparts([]);
  };

  if (!isValidCategory) {
    return null;
  }

  return (
    <section className="pb-12 md:pb-8">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header - toujours visible */}
        <div className="px-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {CATEGORY_LABELS[categoryParam]}
            </h1>
            {loadingExercices ? (
              <p className="text-gray-500 mt-1">
                <span className="inline-block h-5 w-40 bg-gray-200 rounded animate-pulse" />
              </p>
            ) : exercices.length > 0 ? (
              <p className="text-gray-500 mt-1">
                {completedCount}/{exercices.length} exercices complétés
              </p>
            ) : null}
          </div>
          
          {/* Filtres - toujours visible */}
          <div className="mt-4 space-y-4">
            {/* Filtre principal : Tous / Non faits / Faits */}
            <StatusFilterSection filter={filter} onFilterChange={setFilter} />

            {/* Filtre par partie du corps - affiché seulement s'il y a des bodyparts disponibles */}
            {bodypartsWithCounts.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Partie du corps
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Badge "Tous" */}
                  <FilterBadge
                    label="Tous"
                    isActive={isAllBodypartsSelected}
                    category={categoryParam}
                    onClick={handleSelectAllBodyparts}
                  />
                  {bodypartsWithCounts.map(({ value, label, icon, count }) => {
                    const isSelected = selectedBodyparts.includes(value);
                    return (
                      <FilterBadge
                        key={value}
                        label={label}
                        icon={icon}
                        count={count}
                        isActive={isSelected}
                        category={categoryParam}
                        onClick={() => {
                          setSelectedBodyparts(prev => 
                            isSelected 
                              ? prev.filter(bp => bp !== value)
                              : [...prev, value]
                          );
                        }}
                      />
                    );
                  })}
                </div>
          
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4">
          {loadingExercices ? (
            <div className="flex items-center justify-center min-h-screen py-12">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : filteredExercices.length === 0 ? (
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

          {/* Section "Étirements liés" - affichée seulement si on n'est pas dans la catégorie étirement et qu'il y a des étirements liés */}
          {relatedStretchingExercices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="mt-8"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Étirements pour {CATEGORY_LABELS[categoryParam].toLowerCase()}
                </h2>
                <p className="text-sm text-gray-500">
                  Exercices d&apos;étirement qui ciblent les mêmes zones
                </p>
              </div>
              <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                {relatedStretchingExercices.map((exercice) => (
                  <div key={exercice.id} className="h-full">
                    <ExerciceCard
                      exercice={exercice}
                      onEdit={handleEditClick}
                      onCompleted={handleCompleted}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bouton "Ajouter un exercice" - centré en bas de page */}
      <div className="flex justify-center mt-8 mb-6">
        <AddButton 
          href="/exercice/add" 
          label="Ajouter un exercice"
          queryParams={{ category: categoryParam.toLowerCase() }}
          addFromParam
        />
      </div>
    </section>
  );
}
