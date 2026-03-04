'use client';

import { useState, useEffect, useCallback } from 'react';
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

const EXERCICE_FORM_DRAFT_KEY = 'synapso_exercice_form_draft';
const ABANDON_CONFIRM_MESSAGE = 'Vous abandonnez votre brouillon ?';

type FormDataState = {
  name: string;
  descriptionText: string;
  descriptionComment: string;
  workoutRepeat: string;
  workoutSeries: string;
  workoutDuration: string;
  category: ExerciceCategory;
  bodyparts: string[];
  equipments: string[];
  media: MediaData | null;
};

type Draft = {
  formData: FormDataState;
  currentStep: number;
  maxVisitedStep: number;
};

function getDefaultFormData(initialCategory?: ExerciceCategory): FormDataState {
  return {
    name: '',
    descriptionText: '',
    descriptionComment: '',
    workoutRepeat: '',
    workoutSeries: '',
    workoutDuration: '',
    category: (initialCategory || 'UPPER_BODY') as ExerciceCategory,
    bodyparts: [],
    equipments: [],
    media: null,
  };
}

function hasDraft(formData: FormDataState, currentStep: number): boolean {
  if (currentStep > 0) return true;
  if (formData.name.trim()) return true;
  if (formData.descriptionText.trim() || formData.descriptionComment.trim()) return true;
  if (formData.workoutRepeat || formData.workoutSeries || formData.workoutDuration) return true;
  if (formData.bodyparts.length > 0 || formData.equipments.length > 0) return true;
  if (formData.media?.photos?.length || formData.media?.video) return true;
  return false;
}

function loadDraft(initialCategory?: ExerciceCategory): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EXERCICE_FORM_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (
      parsed &&
      typeof parsed.formData === 'object' &&
      typeof parsed.currentStep === 'number' &&
      typeof parsed.maxVisitedStep === 'number' &&
      Number.isInteger(parsed.currentStep) &&
      Number.isInteger(parsed.maxVisitedStep)
    ) {
      return {
        formData: { ...getDefaultFormData(initialCategory), ...parsed.formData, media: null },
        currentStep: Math.min(Math.max(0, parsed.currentStep), TOTAL_STEPS - 1),
        maxVisitedStep: Math.min(Math.max(0, parsed.maxVisitedStep), TOTAL_STEPS - 1),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function saveDraft(draft: Draft): void {
  try {
    const toSave = {
      ...draft,
      formData: { ...draft.formData, media: null },
    };
    localStorage.setItem(EXERCICE_FORM_DRAFT_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(EXERCICE_FORM_DRAFT_KEY);
  } catch {
    // ignore
  }
}

type Props = {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: ExerciceCategory;
};

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const { equipments: allEquipments, equipmentIconsMap, loading: loadingEquipments } = useAllEquipments();

  const isCreateMode = !exerciceId;
  const draft = isCreateMode ? loadDraft(initialCategory) : null;

  const [currentStep, setCurrentStep] = useState(() =>
    draft ? draft.currentStep : 0
  );
  const [maxVisitedStep, setMaxVisitedStep] = useState(() =>
    draft ? draft.maxVisitedStep : exerciceId ? TOTAL_STEPS - 1 : 0
  );
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<FormDataState>(() =>
    draft ? draft.formData : getDefaultFormData(initialCategory)
  );
  const [initialLoading, setInitialLoading] = useState(!!exerciceId);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSuccess = useCallback(() => {
    if (isCreateMode) clearDraft();
    onSuccess?.();
  }, [isCreateMode, onSuccess]);

  const { createOrUpdateMutation, deleteMutation, handleSubmit, handleDelete } = useExerciceFormMutations({
    exerciceId,
    formData,
    setError,
    onSuccess: handleSuccess,
  });

  const hasUnsavedDraft = isCreateMode && hasDraft(formData, currentStep);

  useEffect(() => {
    if (!isCreateMode) return;
    saveDraft({ formData, currentStep, maxVisitedStep });
  }, [isCreateMode, formData, currentStep, maxVisitedStep]);

  useEffect(() => {
    if (!hasUnsavedDraft) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedDraft]);

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
            onClick={
              currentStep === 0
                ? () => {
                    if (hasUnsavedDraft && !window.confirm(ABANDON_CONFIRM_MESSAGE)) return;
                    if (isCreateMode) clearDraft();
                    onCancel?.();
                  }
                : () => goToStep(currentStep - 1)
            }
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
