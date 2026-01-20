'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExerciceCard } from '@/app/components/ExerciceCard';
import { EmptyState } from '@/app/components/EmptyState';
import { SegmentedControl, FilterBadge } from '@/app/components/ui';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import { 
  CATEGORY_LABELS, 
  CATEGORY_ORDER,
  BODYPART_TO_CATEGORY,
  BODYPART_ICONS,
  AVAILABLE_BODYPARTS
} from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { AddButton } from '@/app/components/ui/AddButton';
import { useUser } from '@/app/contexts/UserContext';
import { useExercices } from '@/app/hooks/useExercices';
import clsx from 'clsx';

type FilterType = 'all' | 'notCompleted' | 'completed';

export default function CategoryPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBodypart, setSelectedBodypart] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { effectiveUser } = useUser();

  // Convertir le paramètre URL en catégorie
  const categoryParam = (params.category as string)?.toUpperCase() as ExerciceCategory;
  const isValidCategory = CATEGORY_ORDER.includes(categoryParam);

  // Ne charger les exercices que si le user est chargé et disponible
  const { exercices, loading: loadingExercices, updateExercice } = useExercices({
    category: isValidCategory ? categoryParam : undefined,
  });

  // Charger aussi les exercices d'étirement pour la section "Étirements liés"
  const { exercices: stretchingExercices } = useExercices({
    category: categoryParam !== 'STRETCHING' ? 'STRETCHING' : undefined,
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

  // Filtrer les exercices selon le filtre ET le bodypart
  const filteredExercices = useMemo(() => {
    let filtered = filter === 'all'
      ? exercices
      : filter === 'notCompleted'
      ? exercices.filter(e => !e.completed)
      : exercices.filter(e => e.completed);

    // Filtrer par bodypart si sélectionné
    if (selectedBodypart) {
      filtered = filtered.filter(e => 
        e.bodyparts.includes(selectedBodypart)
      );
    }

    return filtered;
  }, [exercices, filter, selectedBodypart]);

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

    // Filtrer par bodypart si sélectionné
    if (selectedBodypart) {
      filtered = filtered.filter(ex =>
        ex.bodyparts.includes(selectedBodypart)
      );
    }

    return filtered;
  }, [categoryParam, stretchingExercices, selectedBodypart]);

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
      { value: 'notCompleted' as FilterType, label: 'Non faits', count: notCompletedCount },
      { value: 'completed' as FilterType, label: 'Faits', count: completedCount },
    ];
  }, [exercices]);

  if (!isValidCategory) {
    return null;
  }

  return (
    <section className="pb-12 md:pb-8">
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
          
          {/* Filtres - toujours visible */}
          <div className="mt-4 space-y-4">
            {/* Filtre principal : Tous / À faire / Faits */}
            <div>
           
              <SegmentedControl
                options={filterOptionsWithCounts}
                value={filter}
                onChange={setFilter}
                fullWidth
                size="md"
                variant="filter"
              />
            </div>

            {/* Filtre par partie du corps - affiché seulement s'il y a des bodyparts disponibles */}
            {bodypartsWithCounts.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Partie du corps
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBodypart(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedBodypart(null);
                      }
                    }}
                    className={clsx(
                      'h-8 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400',
                      'active:scale-[0.98]',
                      selectedBodypart === null
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    )}
                    aria-label={`Afficher toutes les parties du corps (${exercices.length} exercices)`}
                    aria-pressed={selectedBodypart === null}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>Toutes</span>
                      <span className="text-[10px] font-bold opacity-90">({exercices.length})</span>
                    </span>
                  </button>
                  {bodypartsWithCounts.map(({ value, label, icon, count }) => (
                    <FilterBadge
                      key={value}
                      label={label}
                      icon={icon}
                      count={count}
                      isActive={selectedBodypart === value}
                      category={categoryParam}
                      onClick={() => setSelectedBodypart(value)}
                    />
                  ))}
                </div>
              </div>
            )}
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

    </section>
  );
}
