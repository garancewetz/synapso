import { useState, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { useErrorHandler } from '@/app/hooks/forms/useErrorHandler';

type UseJournalFormOptions<T> = {
  entityId?: number;
  createUrl: string;
  updateUrl: string;
  deleteUrl: string;
  onSuccess?: () => void;
  transformToApi?: (formData: T) => Record<string, unknown>;
};

type UseJournalFormReturn<T> = {
  loading: boolean;
  error: string;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleSubmit: (formData: T) => Promise<void>;
  handleDelete: () => Promise<void>;
};

/**
 * Hook générique pour gérer les formulaires journal (tasks et notes)
 * Centralise la logique de création, mise à jour et suppression
 */
export function useJournalForm<T>({
  entityId,
  createUrl,
  updateUrl,
  deleteUrl,
  onSuccess,
  transformToApi,
}: UseJournalFormOptions<T>): UseJournalFormReturn<T> {
  const { effectiveUser } = useUser();
  const { error, setError, handleError, clearError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = useCallback(async (formData: T) => {
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

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      handleError(err, 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  }, [entityId, createUrl, updateUrl, effectiveUser, onSuccess, transformToApi, clearError, handleError]);

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

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      handleError(err, 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }, [showDeleteConfirm, deleteUrl, effectiveUser, onSuccess, clearError, handleError]);

  return {
    loading,
    error,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmit,
    handleDelete,
  };
}
