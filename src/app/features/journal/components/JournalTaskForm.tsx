'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech } from '@/app/components/ui';
import { useJournalForm } from '../hooks/useJournalForm';
import { useFormData } from '@/app/hooks/forms/useFormData';

type TaskFormData = {
  title: string;
};

type Props = {
  taskId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function JournalTaskForm({ taskId, onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
  });

  // Charger les données initiales
  const { formData: initialData, loading: loadingInitial } = useFormData<TaskFormData>({
    entityId: taskId,
    fetchUrl: `/api/journal/tasks/${taskId}`,
    transform: (data) => ({
      title: (data as { title?: string }).title || '',
    }),
  });

  // Utiliser le hook générique pour la gestion du formulaire
  const {
    loading,
    error,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSubmit: handleFormSubmit,
    handleDelete,
  } = useJournalForm<TaskFormData>({
    entityId: taskId,
    createUrl: '/api/journal/tasks',
    updateUrl: `/api/journal/tasks/${taskId}`,
    deleteUrl: `/api/journal/tasks/${taskId}`,
    onSuccess,
  });

  // Initialiser le formulaire avec les données chargées
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFormSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} />

      <InputWithSpeech
        label="Tâche"
        type="text"
        required
        value={formData.title}
        onValueChange={(value) => setFormData({ ...formData, title: value })}
        disabled={loadingInitial}
      />

      <FormActions
        loading={loading || loadingInitial}
        onSubmitLabel={taskId ? 'Modifier' : 'Créer'}
        onCancel={onCancel}
        showDelete={!!taskId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer la tâche"
        deleteConfirmLabel="⚠️ Confirmer la suppression"
      />
    </form>
  );
}

