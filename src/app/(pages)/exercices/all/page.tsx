'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExerciceCard } from '@/app/components/ExerciceCard';
import { EmptyState } from '@/app/components/EmptyState';
import { StatusFilterSection, EquipmentFilterBadge, AddButton, FilterBadge, Button, BottomSheetModal } from '@/app/components/ui';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { 
  CATEGORY_LABELS,
  CATEGORY_LABELS_SHORT, 
  CATEGORY_ORDER, 
  CATEGORY_ICONS,
  BODYPART_TO_CATEGORY,
  BODYPART_ICONS,
  AVAILABLE_BODYPARTS,
  EXERCICE_STATUS_FILTER_OPTIONS
} from '@/app/constants/exercice.constants';
import { getEquipmentIcon } from '@/app/constants/equipment.constants';
import { useEquipmentMetadata } from '@/app/hooks/useEquipmentMetadata';
import { useExercices } from '@/app/hooks/useExercices';
import { useExerciceStatusFilter } from '@/app/hooks/useExerciceStatusFilter';
import { useExerciceHandlers } from '@/app/hooks/useExerciceHandlers';
import type { Exercice, ExerciceCategory, ExerciceStatusFilter } from '@/app/types/exercice';

export default function EquipmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Récupérer les équipements depuis l'URL (query param)
  const equipmentsFromUrl = searchParams.get('equipments');
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(
    equipmentsFromUrl 
      ? equipmentsFromUrl.split(',').map(eq => decodeURIComponent(eq)).filter(Boolean)
      : []
  );
  const [filter, setFilter] = useState<ExerciceStatusFilter>('all');
  const [selectedCategories, setSelectedCategories] = useState<ExerciceCategory[]>([]);
  const [selectedBodyparts, setSelectedBodyparts] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Utiliser les hooks partagés
  const { filteredExercices } = useExerciceStatusFilter({
    exercices,
    filter,
  });

  const { handleEditClick, handleCompleted } = useExerciceHandlers({
    updateExercice,
    fromPath: '/exercices/all',
  });

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
        ? `/exercices/all?${params.toString()}`
        : '/exercices/all';
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedEquipments, router, searchParams]);

  // Filtrer par catégories sélectionnées
  const exercicesFilteredByCategory = useMemo(() => {
    if (selectedCategories.length === 0) {
      return filteredExercices;
    }
    return filteredExercices.filter(ex => selectedCategories.includes(ex.category));
  }, [filteredExercices, selectedCategories]);

  // Filtrer par bodyparts sélectionnées (global)
  const exercicesFilteredByBodyparts = useMemo(() => {
    if (selectedBodyparts.length === 0) {
      return exercicesFilteredByCategory;
    }
    // L'exercice doit cibler au moins un des bodyparts sélectionnés
    return exercicesFilteredByCategory.filter(ex => 
      ex.bodyparts.some(bp => selectedBodyparts.includes(bp))
    );
  }, [exercicesFilteredByCategory, selectedBodyparts]);

  // Grouper par catégorie
  const exercicesByCategory = useMemo(() => {
    const grouped: Record<ExerciceCategory, Exercice[]> = {
      UPPER_BODY: [],
      LOWER_BODY: [],
      CORE: [],
      STRETCHING: [],
    };
    
    exercicesFilteredByBodyparts.forEach(ex => {
      grouped[ex.category].push(ex);
    });
    
    return grouped;
  }, [exercicesFilteredByBodyparts]);

  // Calculer les bodyparts disponibles globalement avec leurs compteurs
  const bodypartsWithCounts = useMemo(() => {
    // Compter les exercices par bodypart (toutes catégories confondues)
    const counts: Record<string, number> = {};
    filteredExercices.forEach(ex => {
      ex.bodyparts.forEach(bp => {
        counts[bp] = (counts[bp] || 0) + 1;
      });
    });

    // Retourner uniquement les bodyparts qui ont au moins un exercice
    return AVAILABLE_BODYPARTS
      .filter(bp => counts[bp] > 0)
      .map(bp => ({
        value: bp,
        label: bp,
        icon: BODYPART_ICONS[bp] || '',
        count: counts[bp],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredExercices]);

  // Vérifier si le badge "Tous" est actif (aucun équipement sélectionné)
  const isAllEquipmentsSelected = useMemo(() => {
    return selectedEquipments.length === 0;
  }, [selectedEquipments.length]);

  // Fonction pour réinitialiser les équipements (sélectionner "Tous")
  const handleSelectAllEquipments = useCallback(() => {
    setSelectedEquipments([]);
  }, []);

  // Fonction pour toggle une catégorie
  const toggleCategory = useCallback((category: ExerciceCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  // Fonction pour toggle un bodypart
  const toggleBodypart = useCallback((bodypart: string) => {
    setSelectedBodyparts(prev => {
      if (prev.includes(bodypart)) {
        return prev.filter(bp => bp !== bodypart);
      } else {
        return [...prev, bodypart];
      }
    });
  }, []);

  // Fonction pour réinitialiser les bodyparts
  const handleSelectAllBodyparts = useCallback(() => {
    setSelectedBodyparts([]);
  }, []);

  // Vérifier si toutes les bodyparts sont sélectionnées (aucune sélection = toutes)
  const isAllBodypartsSelected = useMemo(() => {
    return selectedBodyparts.length === 0;
  }, [selectedBodyparts.length]);

  // Vérifier si toutes les catégories sont sélectionnées
  const isAllCategoriesSelected = useMemo(() => {
    return selectedCategories.length === 0;
  }, [selectedCategories.length]);

  return (
    <section className="pb-12 md:pb-8 min-h-screen">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header */}
        <div className="px-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Vue globale
            </h1>
            {loadingExercices ? (
              <p className="text-gray-500 mt-1">
                <span className="inline-block h-5 w-48 bg-gray-200 rounded animate-pulse" />
              </p>
            ) : (
              <p className="text-gray-500 mt-1">
                {selectedEquipments.length > 0 
                  ? `${exercicesFilteredByBodyparts.length} exercice${exercicesFilteredByBodyparts.length > 1 ? 's' : ''} avec ${selectedEquipments.length === 1 ? selectedEquipments[0] : `${selectedEquipments.length} équipements`}`
                  : `${exercicesFilteredByBodyparts.length} exercice${exercicesFilteredByBodyparts.length > 1 ? 's' : ''}`
                }
              </p>
            )}
          </div>
          
          {/* Filtres */}
          <div className="mt-4">
            {/* Bouton Filtres (mobile) - ouvre le bottom sheet */}
            <div className="md:hidden">
              <Button
                variant="secondary"
                onClick={() => setIsFiltersOpen(true)}
                className="w-full"
              >
                Filtrer
              </Button>
            </div>

            {/* Filtres sélectionnés - affichage des filtres actifs */}
            {(filter !== 'all' || selectedCategories.length > 0 || selectedBodyparts.length > 0 || selectedEquipments.length > 0) && (
              <div className="mt-3 md:mt-0">
                <div className="flex flex-wrap gap-2">
                  {/* Filtre d'état */}
                  {filter !== 'all' && (
                    <FilterBadge
                      label={EXERCICE_STATUS_FILTER_OPTIONS.find(opt => opt.value === filter)?.label || ''}
                      isActive={true}
                      category="UPPER_BODY"
                      onClick={() => setFilter('all')}
                      ariaLabel="Retirer le filtre d'état"
                      showCloseIcon={true}
                    />
                  )}
                  
                  {/* Catégories sélectionnées */}
                  {selectedCategories.map((category) => (
                    <FilterBadge
                      key={category}
                      label={CATEGORY_LABELS_SHORT[category]}
                      icon={CATEGORY_ICONS[category]}
                      isActive={true}
                      category={category}
                      onClick={() => toggleCategory(category)}
                      ariaLabel={`Retirer le filtre ${CATEGORY_LABELS[category]}`}
                      showCloseIcon={true}
                    />
                  ))}
                  
                  {/* Bodyparts sélectionnées */}
                  {selectedBodyparts.map((bodypart) => {
                    const category = BODYPART_TO_CATEGORY[bodypart] || 'UPPER_BODY';
                    const icon = BODYPART_ICONS[bodypart] || '';
                    return (
                      <FilterBadge
                        key={bodypart}
                        label={bodypart}
                        icon={icon}
                        isActive={true}
                        category={category}
                        onClick={() => toggleBodypart(bodypart)}
                        ariaLabel={`Retirer le filtre ${bodypart}`}
                        showCloseIcon={true}
                      />
                    );
                  })}
                  
                  {/* Équipements sélectionnés */}
                  {selectedEquipments.map((equipment) => {
                    const icon = equipmentIconsMap[equipment] || getEquipmentIcon(equipment);
                    return (
                      <EquipmentFilterBadge
                        key={equipment}
                        label={equipment}
                        icon={icon}
                        isActive={true}
                        onClick={() => toggleEquipment(equipment)}
                        ariaLabel={`Retirer le filtre ${equipment}`}
                        showCloseIcon={true}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtres avancés - visibles sur desktop, dans bottom sheet sur mobile */}
            <div className="hidden md:block mt-4 space-y-4">
              {/* Filtre d'état : Tous / Non faits / Faits */}
              <StatusFilterSection filter={filter} onFilterChange={setFilter} />

              {/* Filtre par catégorie */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterBadge
                    label="Toutes"
                    isActive={isAllCategoriesSelected}
                    category="UPPER_BODY"
                    onClick={() => setSelectedCategories([])}
                  />
                  {CATEGORY_ORDER.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    const categoryExercices = filteredExercices.filter(ex => ex.category === category);
                    return (
                      <FilterBadge
                        key={category}
                        label={CATEGORY_LABELS_SHORT[category]}
                        icon={CATEGORY_ICONS[category]}
                        count={categoryExercices.length}
                        isActive={isSelected}
                        category={category}
                        onClick={() => toggleCategory(category)}
                        ariaLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${CATEGORY_LABELS[category]}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Filtre par partie du corps */}
              {bodypartsWithCounts.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Partie du corps
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FilterBadge
                      label="Toutes"
                      isActive={isAllBodypartsSelected}
                      category="UPPER_BODY"
                      onClick={handleSelectAllBodyparts}
                    />
                    {bodypartsWithCounts.map(({ value, label, icon, count }) => {
                      const isSelected = selectedBodyparts.includes(value);
                      const category = BODYPART_TO_CATEGORY[value] || 'UPPER_BODY';
                      return (
                        <FilterBadge
                          key={value}
                          label={label}
                          icon={icon}
                          count={count}
                          isActive={isSelected}
                          category={category}
                          onClick={() => toggleBodypart(value)}
                          ariaLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${label} (${count} exercices)`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

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
                    <EquipmentFilterBadge
                      label="Tous"
                      isActive={isAllEquipmentsSelected}
                      onClick={handleSelectAllEquipments}
                    />
                    {equipmentsWithCounts.map(({ name, count }) => {
                      const icon = equipmentIconsMap[name] || getEquipmentIcon(name);
                      const isSelected = selectedEquipments.includes(name);
                      return (
                        <EquipmentFilterBadge
                          key={name}
                          label={name}
                          icon={icon}
                          count={count}
                          isActive={isSelected}
                          onClick={() => toggleEquipment(name)}
                          ariaLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${name} (${count} exercices)`}
                        />
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

          {/* Bottom Sheet pour les filtres avancés (mobile) */}
          <BottomSheetModal
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            showFooterClose
            closeLabel="Fermer"
          >
            <div className="px-5 py-4 space-y-6 overflow-y-auto">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
                {!loadingExercices && (
                  <p className="text-sm text-gray-500 mt-1">
                    {exercicesFilteredByBodyparts.length} exercice{exercicesFilteredByBodyparts.length > 1 ? 's' : ''} affiché{exercicesFilteredByBodyparts.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Filtre d'état : Tous / Non faits / Faits */}
              <StatusFilterSection filter={filter} onFilterChange={setFilter} />

              {/* Filtre par catégorie */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterBadge
                    label="Toutes"
                    isActive={isAllCategoriesSelected}
                    category="UPPER_BODY"
                    onClick={() => setSelectedCategories([])}
                  />
                  {CATEGORY_ORDER.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    const categoryExercices = filteredExercices.filter(ex => ex.category === category);
                    return (
                      <FilterBadge
                        key={category}
                        label={CATEGORY_LABELS_SHORT[category]}
                        icon={CATEGORY_ICONS[category]}
                        count={categoryExercices.length}
                        isActive={isSelected}
                        category={category}
                        onClick={() => toggleCategory(category)}
                        ariaLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${CATEGORY_LABELS[category]}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Filtre par partie du corps */}
              {bodypartsWithCounts.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Partie du corps
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FilterBadge
                      label="Toutes"
                      isActive={isAllBodypartsSelected}
                      category="UPPER_BODY"
                      onClick={handleSelectAllBodyparts}
                    />
                    {bodypartsWithCounts.map(({ value, label, icon, count }) => {
                      const isSelected = selectedBodyparts.includes(value);
                      const category = BODYPART_TO_CATEGORY[value] || 'UPPER_BODY';
                      return (
                        <FilterBadge
                          key={value}
                          label={label}
                          icon={icon}
                          count={count}
                          isActive={isSelected}
                          category={category}
                          onClick={() => toggleBodypart(value)}
                          ariaLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${label} (${count} exercices)`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

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
                    <EquipmentFilterBadge
                      label="Tous"
                      isActive={isAllEquipmentsSelected}
                      onClick={handleSelectAllEquipments}
                    />
                    {equipmentsWithCounts.map(({ name, count }) => {
                      const icon = equipmentIconsMap[name] || getEquipmentIcon(name);
                      const isSelected = selectedEquipments.includes(name);
                      return (
                        <EquipmentFilterBadge
                          key={name}
                          label={name}
                          icon={icon}
                          count={count}
                          isActive={isSelected}
                          onClick={() => toggleEquipment(name)}
                          ariaLabel={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${name} (${count} exercices)`}
                        />
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
          </BottomSheetModal>
        </div>

        {/* Exercices - toujours affichés, filtrés par équipements si sélectionnés */}
        <div className="px-4">
          {loadingExercices ? (
            <div className="flex items-center justify-center min-h-screen py-12">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : exercicesFilteredByBodyparts.length === 0 ? (
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
                    : "Aucun exercice"
                }
                message={
                  filter === 'notCompleted'
                    ? "Félicitations, vous avez complété tous les exercices correspondant aux filtres sélectionnés."
                    : filter === 'completed'
                    ? "Vous n'avez pas encore complété d'exercices correspondant aux filtres sélectionnés."
                    : "Aucun exercice ne correspond aux filtres sélectionnés."
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
