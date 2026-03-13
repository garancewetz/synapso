import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { useToast } from '@/app/contexts/ToastContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { getDateKey } from '@/app/utils/date.utils';
import { queryKeys } from '@/app/lib/api-queries';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { MediaData } from '@/app/types/exercice';

type FormData = {
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

type UseExerciceFormMutationsParams = {
  exerciceId?: number;
  formData: FormData;
  setError: (msg: string) => void;
  onSuccess?: () => void;
};

export function useExerciceFormMutations({
  exerciceId,
  formData,
  setError,
  onSuccess,
}: UseExerciceFormMutationsParams) {
  const { effectiveUser } = useUser();
  const { showToast } = useToast();
  const { selectedDate, isDateSelected } = useTimeContext();
  const queryClient = useQueryClient();

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
        headers: { 'Content-Type': 'application/json' },
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
        queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all, refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all, refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categoryStats.all, refetchType: 'active' }),
      ]);
      onSuccess?.();
    },
  });

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
        queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all, refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: queryKeys.history.all, refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categoryStats.all, refetchType: 'active' }),
      ]);
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    let createdAtDate: string | undefined;
    if (isDateSelected && selectedDate && !exerciceId) {
      createdAtDate = getDateKey(selectedDate) ?? undefined;
    }

    createOrUpdateMutation.mutate({
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
    });
  };

  const handleDelete = (onDeleteConfirm: () => void) => {
    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }
    setError('');
    deleteMutation.mutate(undefined, {
      onSettled: onDeleteConfirm,
    });
  };

  return { createOrUpdateMutation, deleteMutation, handleSubmit, handleDelete };
}
