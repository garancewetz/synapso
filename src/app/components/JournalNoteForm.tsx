'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech, TextareaWithSpeech } from '@/app/components/ui';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  noteId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function JournalNoteForm({ noteId, onSuccess, onCancel }: Props) {
  const { effectiveUser } = useUser();
  const [formData, setFormData] = useState({
    content: '',
    title: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (noteId && effectiveUser) {
      fetch(`/api/journal/notes/${noteId}`, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // Convertir la date ISO en format YYYY-MM-DD pour l'input date
          let dateValue = '';
          if (data.date) {
            const date = new Date(data.date);
            if (!isNaN(date.getTime())) {
              dateValue = date.toISOString().split('T')[0];
            }
          }
          
          setFormData({
            content: data.content || '',
            title: data.title || '',
            date: dateValue,
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de la note');
        });
    }
  }, [noteId, effectiveUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!effectiveUser) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    const noteData = {
      content: formData.content,
      title: formData.title || null,
      date: formData.date || null,
      userId: effectiveUser.id,
    };

    try {
      const url = noteId ? `/api/journal/notes/${noteId}` : '/api/journal/notes';
      const method = noteId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'enregistrement de la note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
    setError('');

    try {
      const response = await fetch(`/api/journal/notes/${noteId}`, {
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
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression de la note');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
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
      />

      <TextareaWithSpeech
        label="Note"
        rows={4}
        required
        value={formData.content}
        onValueChange={(value) => setFormData({ ...formData, content: value })}
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
        />
        <p className="mt-1 text-xs text-gray-500">Par défaut : date d&apos;ajout</p>
      </div>

      <FormActions
        loading={loading}
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

