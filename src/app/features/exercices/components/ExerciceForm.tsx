'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/app/contexts/UserContext';
import { useToast } from '@/app/contexts/ToastContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { setHours, setMinutes, setSeconds } from 'date-fns';
import { ErrorMessage, FormActions, Loader } from '@/app/components';
import { Button } from '@/app/components/ui';
import { ExerciceCategory, type MediaData } from '@/app/types/exercice';
import { useAllEquipments } from '@/app/hooks/useAllEquipments';
import { MediaUploader } from '@/app/components/ui';
import { queryKeys } from '@/app/lib/api-queries';
import { ExerciceFormCategory } from './ExerciceForm/ExerciceFormCategory';
import { ExerciceFormBodyparts } from './ExerciceForm/ExerciceFormBodyparts';
import { ExerciceFormFields } from './ExerciceForm/ExerciceFormFields';
import { ExerciceFormWorkout } from './ExerciceForm/ExerciceFormWorkout';
import { ExerciceFormEquipments } from './ExerciceForm/ExerciceFormEquipments';
import { ExerciceFormStepper } from './ExerciceForm/ExerciceFormStepper';

const TOTAL_STEPS = 3;

type Props = {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: ExerciceCategory;
};

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const { showToast } = useToast();
  const { selectedDate, isDateSelected } = useSelectedDate();
  const { equipments: allEquipments, equipmentIconsMap, loading: loadingEquipments } = useAllEquipments();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(exerciceId ? TOTAL_STEPS - 1 : 0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const [formData, setFormData] = useState({
    name: '',
    descriptionText: '',
    descriptionComment: '',
    workoutRepeat: '',
    workoutSeries: '',
    workoutDuration: '',
    category: (initialCategory || 'UPPER_BODY') as ExerciceCategory,
    bodyparts: [] as string[],
    equipments: [] as string[],
    media: null as MediaData | null,
  });
  const [initialLoading, setInitialLoading] = useState(!!exerciceId);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ⚡ MUTATION: Créer ou éditer un exercice
  const createOrUpdateMutation = useMutation({
    mutationFn: async (exerciceData: {
      name: string;
      description: { text: string; comment: string | null };
      workout: { repeat: string | null; series: string | null; duration: string | null };
      category: ExerciceCategory;
      bodyparts: string[];
      equipments: string[];
      media: MediaData | null;
      userId: number;
      createdAt?: string;
    }) => {
      const url = exerciceId ? `/api/exercices/${exerciceId}` : '/api/exercices';
      const method = exerciceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(exerciceData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      return response.json();
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'exercice';
      setError(message);
      showToast(message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.exercices.all,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.history.all,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.categoryStats.all,
          refetchType: 'active',
        }),
      ]);

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  // ⚡ MUTATION: Supprimer un exercice
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/exercices/${exerciceId}?userId=${effectiveUser?.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'exercice';
      setError(message);
      showToast(message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.exercices.all,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.history.all,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.categoryStats.all,
          refetchType: 'active',
        }),
      ]);

      if (onSuccess) {
        onSuccess();
      }
    },
  });

  useEffect(() => {
    if (exerciceId && effectiveUser) {
      fetch(`/api/exercices/${exerciceId}?userId=${effectiveUser.id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || '',
            descriptionText: data.description?.text || '',
            descriptionComment: data.description?.comment || '',
            workoutRepeat: data.workout?.repeat || '',
            workoutSeries: data.workout?.series || '',
            workoutDuration: data.workout?.duration || '',
            category: data.category || 'UPPER_BODY',
            bodyparts: data.bodyparts || [],
            equipments: data.equipments || [],
            media: data.media || null,
          });
        })
        .catch(() => {
          setError('Erreur lors du chargement de l\'exercice');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [exerciceId, effectiveUser]);

  const toggleBodypart = (bodypart: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyparts: prev.bodyparts.includes(bodypart)
        ? prev.bodyparts.filter((bp) => bp !== bodypart)
        : [...prev.bodyparts, bodypart],
    }));
  };

  const toggleEquipment = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipments: prev.equipments.includes(equipment)
        ? prev.equipments.filter((eq) => eq !== equipment)
        : [...prev.equipments, equipment],
    }));
  };

  const addNewEquipment = (equipment: string) => {
    if (!formData.equipments.includes(equipment)) {
      setFormData((prev) => ({
        ...prev,
        equipments: [...prev.equipments, equipment],
      }));
    }
  };

  const goToStep = (step: number) => {
    if (step === currentStep) return;

    // Validation avant d'avancer depuis l'étape 1
    if (step > currentStep && currentStep === 0 && !formData.name.trim()) {
      setError('Le nom de l\'exercice est obligatoire');
      return;
    }

    setError('');
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    setMaxVisitedStep((prev) => Math.max(prev, step));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom de l\'exercice est obligatoire');
      return;
    }

    setError('');

    // Si on est en mode sablier, utiliser la date sélectionnée à midi
    let createdAtDate: string | undefined;
    if (isDateSelected && selectedDate && !exerciceId) {
      const dateAtNoon = setSeconds(setMinutes(setHours(new Date(selectedDate), 12), 0), 0);
      createdAtDate = dateAtNoon.toISOString();
    }

    const exerciceData = {
      name: formData.name,
      description: {
        text: formData.descriptionText,
        comment: formData.descriptionComment || null,
      },
      workout: {
        repeat: formData.workoutRepeat || null,
        series: formData.workoutSeries || null,
        duration: formData.workoutDuration || null,
      },
      category: formData.category,
      bodyparts: formData.bodyparts,
      equipments: formData.equipments,
      media: formData.media,
      userId: effectiveUser.id,
      ...(createdAtDate && { createdAt: createdAtDate }),
    };

    createOrUpdateMutation.mutate(exerciceData);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }

    setError('');
    deleteMutation.mutate(undefined, {
      onSettled: () => {
        setShowDeleteConfirm(false);
      },
    });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="large" />
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ExerciceFormStepper
        currentStep={currentStep}
        maxVisitedStep={maxVisitedStep}
        onStepClick={goToStep}
        isEditMode={!!exerciceId}
      />

      <ErrorMessage message={error} />

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Étape 1 : L'exercice */}
            {currentStep === 0 && (
              <ExerciceFormFields
                name={formData.name}
                descriptionText={formData.descriptionText}
                descriptionComment={formData.descriptionComment}
                onNameChange={(value) => setFormData({ ...formData, name: value })}
                onDescriptionTextChange={(value) => setFormData({ ...formData, descriptionText: value })}
                onDescriptionCommentChange={(value) => setFormData({ ...formData, descriptionComment: value })}
              />
            )}

            {/* Étape 2 : Classification */}
            {currentStep === 1 && (
              <>
                <ExerciceFormCategory
                  category={formData.category}
                  onCategoryChange={(category) => setFormData({ ...formData, category })}
                />
                <ExerciceFormBodyparts
                  selectedBodyparts={formData.bodyparts}
                  onToggleBodypart={toggleBodypart}
                />
              </>
            )}

            {/* Étape 3 : Détails */}
            {currentStep === 2 && (
              <>
                <ExerciceFormWorkout
                  workoutRepeat={formData.workoutRepeat}
                  workoutSeries={formData.workoutSeries}
                  workoutDuration={formData.workoutDuration}
                  onWorkoutRepeatChange={(value) => setFormData({ ...formData, workoutRepeat: value })}
                  onWorkoutSeriesChange={(value) => setFormData({ ...formData, workoutSeries: value })}
                  onWorkoutDurationChange={(value) => setFormData({ ...formData, workoutDuration: value })}
                />

                <ExerciceFormEquipments
                  selectedEquipments={formData.equipments}
                  allEquipments={allEquipments}
                  equipmentIconsMap={equipmentIconsMap}
                  loadingEquipments={loadingEquipments}
                  onToggleEquipment={toggleEquipment}
                  onAddEquipment={addNewEquipment}
                />

                <MediaUploader
                  value={formData.media?.photos || []}
                  onChange={(photos) => setFormData({ ...formData, media: photos.length > 0 ? { ...formData.media, photos } : null })}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation entre étapes */}
      <div className="space-y-3 pt-4">
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={currentStep === 0 ? onCancel : () => goToStep(currentStep - 1)}
          >
            {currentStep === 0 ? 'Annuler' : '← Précédent'}
          </Button>
          {currentStep < TOTAL_STEPS - 1 && (
            <Button
              variant="action"
              onClick={() => goToStep(currentStep + 1)}
            >
              Suivant →
            </Button>
          )}
        </div>

        {/* Bouton Enregistrer : toujours visible en édition, seulement à la dernière étape en création */}
        {(exerciceId || currentStep === TOTAL_STEPS - 1) && (
          <FormActions
            loading={createOrUpdateMutation.isPending || deleteMutation.isPending}
            onSubmitLabel={exerciceId ? 'Enregistrer les modifications' : 'Créer l\'exercice'}
          />
        )}
      </div>

      {/* Bouton supprimer accessible depuis toutes les étapes en mode édition */}
      {exerciceId && (
        <div className="pt-2 border-t border-gray-200">
          <Button
            variant={showDeleteConfirm ? 'danger' : 'danger-outline'}
            onClick={handleDelete}
            disabled={createOrUpdateMutation.isPending || deleteMutation.isPending}
            className="w-full"
          >
            {showDeleteConfirm ? '⚠️ Confirmer la suppression' : "Supprimer l'exercice"}
          </Button>
        </div>
      )}
    </form>
  );
}
