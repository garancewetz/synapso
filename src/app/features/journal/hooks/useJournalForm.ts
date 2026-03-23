import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys } from '@/app/lib/api-queries';

type UseJournalFormOptions<T> = {
  entityId?: number;
  createUrl: string;
  updateUrl: string;
  deleteUrl: string;
  onSuccess?: (createdNoteId?: number) => void;
  transformToApi?: (formData: T) => Record<string, unknown>;
};

type UseJournalFormReturn<T> = {
  loading: boolean;
  error: string;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleSubmit: (formData: T) => Promise<number | void>;
  handleDelete: () => Promise<void>;
};

export function useJournalForm<T>({
  entityId,
  createUrl,
  updateUrl,
  deleteUrl,
  onSuccess,
  transformToApi,
}: UseJournalFormOptions<T>): UseJournalFormReturn<T> {
  const { effectiveUser } = useUser();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const clearError = useCallback(() => setError(''), []);
  const handleError = useCallback((err: unknown, defaultMessage: string) => {
    setError(err instanceof Error ? err.message : defaultMessage);
  }, []);

  const handleSubmit = useCallback(async (formData: T): Promise<number | void> => {
    if (!effectiveUser) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    clearError();

    try {
      const url = entityId ? updateUrl : createUrl;
      const method = entityId ? 'PUT' : 'POST';

      const apiData = transformToApi 
        ? { ...transformToApi(formData), userId: effectiveUser.id }
        : { ...(formData as Record<string, unknown>), userId: effectiveUser.id };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      const isCreate = !entityId && method === 'POST';
      const createdNoteId = isCreate ? (await response.json() as { id?: number })?.id : undefined;

      await queryClient.invalidateQueries({ queryKey: queryKeys.journalNotes.all });

      if (onSuccess) {
        onSuccess(createdNoteId);
      }

      return createdNoteId;
    } catch (err) {
      handleError(err, 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  }, [entityId, createUrl, updateUrl, effectiveUser, onSuccess, transformToApi, handleError, clearError, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (!effectiveUser) {
      setError('Utilisateur non connecté');
      setShowDeleteConfirm(false);
      return;
    }

    setLoading(true);
    clearError();

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.journalNotes.all });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      handleError(err, 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }, [showDeleteConfirm, deleteUrl, effectiveUser, onSuccess, handleError, clearError, queryClient]);

  return {
    loading,
    error,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmit,
    handleDelete,
  };
}
