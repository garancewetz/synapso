'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExerciceCard } from '@/app/components/ExerciceCard';
import { EmptyState } from '@/app/components/EmptyState';
import { AddButton, SegmentedControl } from '@/app/components/ui';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { getEquipmentIcon } from '@/app/constants/equipment.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useEquipmentMetadata } from '@/app/hooks/useEquipmentMetadata';
import { useExercices } from '@/app/hooks/useExercices';
import type { Exercice } from '@/app/types';
import { ExerciceCategory } from '@/app/types/exercice';
import clsx from 'clsx';

type FilterType = 'all' | 'notCompleted' | 'completed';

export default function EquipmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectiveUser } = useUser();
  
  // Récupérer les équipements depuis l'URL (query param)
  const equipmentsFromUrl = searchParams.get('equipments');
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(
    equipmentsFromUrl 
      ? equipmentsFromUrl.split(',').map(eq => decodeURIComponent(eq)).filter(Boolean)
      : []
  );
  const [filter, setFilter] = useState<FilterType>('all');

  // Charger les métadonnées des équipements via hook personnalisé
  const { equipmentsWithCounts, equipmentIconsMap, loading: loadingMetadata } = useEquipmentMetadata();

  // Mémoriser les options pour éviter les re-renders inutiles du hook
  // Si aucun équipement n'est sélectionné, on charge tous les exercices (undefined = pas de filtre)
  // Sinon, on filtre par les équipements sélectionnés
  const exercicesOptions = useMemo(() => {
    if (selectedEquipments.length === 0) {
      return undefined; // Pas de filtre = tous les exercices
    }
    return {
      equipments: selectedEquipments,
    };
  }, [selectedEquipments]);

  // Charger les exercices via hook personnalisé avec filtrage par équipements côté serveur
  const { exercices, loading: loadingExercices, updateExercice } = useExercices(exercicesOptions);

  // Fonction pour toggle un équipement dans la sélection
  const toggleEquipment = useCallback((equipmentName: string) => {
    setSelectedEquipments(prev => {
      if (prev.includes(equipmentName)) {
        return prev.filter(eq => eq !== equipmentName);
      } else {
        return [...prev, equipmentName];
      }
    });
  }, []);

  // Mettre à jour l'URL quand les équipements changent
  useEffect(() => {
    const currentEquipments = searchParams.get('equipments');
    const expectedEquipments = selectedEquipments.length > 0 
      ? selectedEquipments.map(eq => encodeURIComponent(eq)).join(',')
      : null;
    
    // Ne mettre à jour l'URL que si elle est différente de l'état actuel
    if (currentEquipments !== expectedEquipments) {
      const params = new URLSearchParams();
      if (selectedEquipments.length > 0) {
        params.set('equipments', selectedEquipments.map(eq => encodeURIComponent(eq)).join(','));
      }
      const newUrl = params.toString() 
        ? `/exercices/equipments?${params.toString()}`
        : '/exercices/equipments';
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedEquipments, router, searchParams]);

  const handleEditClick = useCallback((id: number) => {
    router.push(`/exercice/edit/${id}?from=${encodeURIComponent('/exercices/equipments')}`);
  }, [router]);

  const handleCompleted = useCallback((updatedExercice: Exercice) => {
    updateExercice(updatedExercice);
  }, [updateExercice]);

  // Filtrer les exercices selon le filtre ET les équipements sélectionnés
  const filteredExercices = useMemo(() => {
    const filtered = filter === 'all'
      ? exercices
      : filter === 'notCompleted'
      ? exercices.filter(e => !e.completed)
      : exercices.filter(e => e.completed);

    return filtered;
  }, [exercices, filter]);

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

  // Grouper par catégorie
  const exercicesByCategory = useMemo(() => {
    const grouped: Record<ExerciceCategory, Exercice[]> = {
      UPPER_BODY: [],
      LOWER_BODY: [],
      CORE: [],
      STRETCHING: [],
    };
    
    filteredExercices.forEach(ex => {
      grouped[ex.category].push(ex);
    });
    
    return grouped;
  }, [filteredExercices]);

  return (
    <section className="pb-12 md:pb-8">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header */}
        <div className="px-4 mb-6">
          <div className={clsx(
            'flex items-start gap-3',
            'justify-between',
            effectiveUser?.dominantHand === 'LEFT' && 'md:flex-row-reverse'
          )}>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Filtrer par équipement
              </h1>
              {loadingExercices ? (
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mt-1" />
              ) : exercices.length > 0 ? (
                <p className="text-gray-500 mt-1">
                  {selectedEquipments.length > 0 
                    ? `${filteredExercices.length} exercice${filteredExercices.length > 1 ? 's' : ''} avec ${selectedEquipments.length === 1 ? selectedEquipments[0] : `${selectedEquipments.length} équipements`}`
                    : `${filteredExercices.length} exercice${filteredExercices.length > 1 ? 's' : ''}`
                  }
                </p>
              ) : null}
            </div>
            <AddButton 
              href="/exercice/add" 
              label="Ajouter un exercice"
              className={clsx(
                'shrink-0',
                effectiveUser?.dominantHand === 'LEFT' && 'md:order-last'
              )}
            />
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

            {/* Filtre par équipement */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Équipement
              </label>
              {loadingMetadata ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : equipmentsWithCounts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {equipmentsWithCounts.map(({ name, count }) => {
                    const icon = equipmentIconsMap[name] || getEquipmentIcon(name);
                    const isSelected = selectedEquipments.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleEquipment(name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleEquipment(name);
                          }
                        }}
                        className={clsx(
                          'h-8 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400',
                          'active:scale-[0.98]',
                          isSelected
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        )}
                        aria-label={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${name} (${count} exercices)`}
                        aria-pressed={isSelected}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{icon}</span>
                          <span>{name}</span>
                          <span className="text-[10px] font-bold opacity-90">({count})</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun équipement disponible pour le moment
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Exercices - toujours affichés, filtrés par équipements si sélectionnés */}
        <div className="px-4">
          {loadingExercices ? (
            <div className="flex items-center justify-center py-12">
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
                    ? selectedEquipments.length > 0
                      ? `Tous les exercices avec ${selectedEquipments.length === 1 ? selectedEquipments[0] : 'ces équipements'} sont faits !`
                      : "Tous les exercices sont faits !"
                    : filter === 'completed'
                    ? selectedEquipments.length > 0
                      ? `Aucun exercice fait avec ${selectedEquipments.length === 1 ? selectedEquipments[0] : 'ces équipements'}`
                      : "Aucun exercice fait"
                    : selectedEquipments.length > 0
                    ? `Aucun exercice avec ${selectedEquipments.length === 1 ? selectedEquipments[0] : 'ces équipements'}`
                    : "Aucun exercice"
                }
                message={
                  filter === 'notCompleted'
                    ? selectedEquipments.length > 0
                      ? "Félicitations, vous avez complété tous les exercices avec ces équipements."
                      : "Félicitations, vous avez complété tous les exercices."
                    : filter === 'completed'
                    ? selectedEquipments.length > 0
                      ? "Vous n'avez pas encore complété d'exercices avec ces équipements."
                      : "Vous n'avez pas encore complété d'exercices."
                    : selectedEquipments.length > 0
                    ? "Aucun exercice n'utilise ces équipements pour le moment."
                    : "Aucun exercice disponible pour le moment."
                }
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
    </section>
  );
}
