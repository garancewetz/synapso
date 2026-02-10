'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech, TextareaWithSpeech } from '@/app/components/ui';
import { useJournalForm } from '../hooks/useJournalForm';
import { useFormData } from '@/app/hooks/forms/useFormData';

type NoteFormData = {
  content: string;
  title: string;
  date: string;
};

type Props = {
  noteId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function JournalNoteForm({ noteId, onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState<NoteFormData>({
    content: '',
    title: '',
    date: '',
  });

  // Charger les données initiales
  const { formData: initialData, loading: loadingInitial } = useFormData<NoteFormData>({
    entityId: noteId,
    fetchUrl: `/api/journal/notes/${noteId}`,
    transform: (data) => {
      const noteData = data as { content?: string; title?: string; date?: string };
      // Convertir la date ISO en format YYYY-MM-DD pour l'input date
      let dateValue = '';
      if (noteData.date) {
        const date = new Date(noteData.date);
        if (!isNaN(date.getTime())) {
          dateValue = date.toISOString().split('T')[0];
        }
      }
      return {
        content: noteData.content || '',
        title: noteData.title || '',
        date: dateValue,
      };
    },
  });

  // Utiliser le hook générique pour la gestion du formulaire
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
      content: data.content,
      title: data.title || null,
      date: data.date || null,
    }),
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
        label="Titre"
        type="text"
        value={formData.title}
        onValueChange={(value) => setFormData({ ...formData, title: value })}
        placeholder="Optionnel - pour organiser vos notes"
        disabled={loadingInitial}
      />

      <TextareaWithSpeech
        label="Note"
        rows={4}
        required
        value={formData.content}
        onValueChange={(value) => setFormData({ ...formData, content: value })}
        disabled={loadingInitial}
      />

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Date (optionnel)"
          disabled={loadingInitial}
        />
        <p className="mt-1 text-xs text-gray-500">Par défaut : date d&apos;ajout</p>
      </div>

      <FormActions
        loading={loading || loadingInitial}
        onSubmitLabel={noteId ? 'Modifier' : 'Créer'}
        onCancel={onCancel}
        showDelete={!!noteId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer la note"
        deleteConfirmLabel="⚠️ Confirmer la suppression"
      />
    </form>
  );
}

