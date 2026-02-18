'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech, TextareaWithSpeech } from '@/app/components/ui';
import { useJournalForm } from '../hooks/useJournalForm';
import { useFormData } from '@/app/hooks/forms/useFormData';

type NoteFormData = {
  title: string;
  description: string;
};

type Props = {
  noteId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function JournalNoteForm({ noteId, onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    description: '',
  });

  const { formData: initialData, loading: loadingInitial } = useFormData<NoteFormData>({
    entityId: noteId,
    fetchUrl: `/api/journal/notes/${noteId}`,
    transform: (data) => {
      const noteData = data as { title?: string; description?: string };
      return {
        title: noteData.title || '',
        description: noteData.description || '',
      };
    },
  });

  const {
    loading,
    error,
    showDeleteConfirm,
    handleSubmit: handleFormSubmit,
    handleDelete,
  } = useJournalForm<NoteFormData>({
    entityId: noteId,
    createUrl: '/api/journal/notes',
    updateUrl: `/api/journal/notes/${noteId}`,
    deleteUrl: `/api/journal/notes/${noteId}`,
    onSuccess,
    transformToApi: (data) => ({
      title: data.title,
      description: data.description,
    }),
  });

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
        label="Titre"
        type="text"
        required
        value={formData.title}
        onValueChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="Titre de la note"
        disabled={loadingInitial}
      />

      <TextareaWithSpeech
        label="Description"
        rows={4}
        value={formData.description}
        onValueChange={(value) => setFormData({ ...formData, description: value })}
        placeholder="Description (optionnel)"
        disabled={loadingInitial}
      />

      <FormActions
        loading={loading || loadingInitial}
        onSubmitLabel={noteId ? 'Modifier' : 'Créer'}
        onCancel={onCancel}
        showDelete={!!noteId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer la note"
        deleteConfirmLabel="Confirmer la suppression"
      />
    </form>
  );
}
