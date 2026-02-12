'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { setHours, setMinutes, setSeconds } from 'date-fns';
import { ErrorMessage, FormActions, Loader } from '@/app/components';
import { ExerciceCategory, type MediaData } from '@/app/types/exercice';
import { useAllEquipments } from '@/app/hooks/useAllEquipments';
import { MediaUploader } from '@/app/features/exercices';
import { queryKeys } from '@/app/lib/api-queries';
import { ExerciceFormCategory } from './ExerciceForm/ExerciceFormCategory';
import { ExerciceFormBodyparts } from './ExerciceForm/ExerciceFormBodyparts';
import { ExerciceFormFields } from './ExerciceForm/ExerciceFormFields';
import { ExerciceFormWorkout } from './ExerciceForm/ExerciceFormWorkout';
import { ExerciceFormEquipments } from './ExerciceForm/ExerciceFormEquipments';

type Props = {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: ExerciceCategory;
};

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const { selectedDate, isDateSelected } = useSelectedDate();
  const { equipments: allEquipments, equipmentIconsMap, loading: loadingEquipments } = useAllEquipments();
  const queryClient = useQueryClient();
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
      console.error('Erreur lors de l\'enregistrement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de l\'exercice');
    },
    onSuccess: async () => {
      // ⚡ CACHE INVALIDATION: TanStack Query gère automatiquement la réactivité
      // Invalider les queries concernées - TanStack Query refetch automatiquement les queries actives
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
      console.error('Erreur lors de la suppression:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'exercice');
    },
    onSuccess: async () => {
      // ⚡ CACHE INVALIDATION: TanStack Query gère automatiquement la réactivité
      // Les invalidations avec refetchType: 'active' forcent le refetch immédiat des queries actives
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
      // Charger l'exercice existant
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
      // Créer une date à midi pour le jour sélectionné
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ErrorMessage message={error} />

      <ExerciceFormCategory
        category={formData.category}
        onCategoryChange={(category) => setFormData({ ...formData, category })}
      />

      <ExerciceFormBodyparts
        selectedBodyparts={formData.bodyparts}
        onToggleBodypart={toggleBodypart}
      />

      <ExerciceFormFields
        name={formData.name}
        descriptionText={formData.descriptionText}
        descriptionComment={formData.descriptionComment}
        onNameChange={(value) => setFormData({ ...formData, name: value })}
        onDescriptionTextChange={(value) => setFormData({ ...formData, descriptionText: value })}
        onDescriptionCommentChange={(value) => setFormData({ ...formData, descriptionComment: value })}
      />

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
        value={formData.media}
        onChange={(media) => setFormData({ ...formData, media })}
      />

      <FormActions
        loading={createOrUpdateMutation.isPending || deleteMutation.isPending}
        onSubmitLabel={exerciceId ? 'Enregistrer les modifications' : 'Créer l\'exercice'}
        onCancel={onCancel}
        showDelete={!!exerciceId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer l'exercice"
        deleteConfirmLabel="⚠️ Confirmer la suppression"
      />
    </form>
  );
}
