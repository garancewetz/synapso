'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@/app/contexts/UserContext';
import { ErrorMessage, FormActions, Loader } from '@/app/components';
import { Button } from '@/app/components/ui';
import { ExerciceCategory, type MediaData } from '@/app/types/exercice';
import { useAllEquipments } from '@/app/hooks/useAllEquipments';
import { useExerciceFormMutations } from '@/app/features/exercices/hooks/useExerciceFormMutations';
import { ExerciceFormStepper } from './ExerciceForm/ExerciceFormStepper';
import { ExerciceFormStepContent } from './ExerciceForm/ExerciceFormStepContent';

const TOTAL_STEPS = 3;

type Props = {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: ExerciceCategory;
};

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const { equipments: allEquipments, equipmentIconsMap, loading: loadingEquipments } = useAllEquipments();

  const [currentStep, setCurrentStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(exerciceId ? TOTAL_STEPS - 1 : 0);
  const [direction, setDirection] = useState(1);

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

  const { createOrUpdateMutation, deleteMutation, handleSubmit, handleDelete } = useExerciceFormMutations({
    exerciceId,
    formData,
    setError,
    onSuccess,
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

  const onDeleteClick = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    handleDelete(() => setShowDeleteConfirm(false));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="large" />
      </div>
    );
  }

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
          <ExerciceFormStepContent
            currentStep={currentStep}
            direction={direction}
            formData={formData}
            setFormData={setFormData}
            toggleBodypart={toggleBodypart}
            toggleEquipment={toggleEquipment}
            addNewEquipment={addNewEquipment}
            allEquipments={allEquipments}
            equipmentIconsMap={equipmentIconsMap}
            loadingEquipments={loadingEquipments}
          />
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
            onClick={onDeleteClick}
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
