'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech, TextareaWithSpeech } from '@/app/components/ui';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  itemId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function AphasieForm({ itemId, onSuccess, onCancel }: Props) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    quote: '',
    meaning: '',
    date: '',
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetch(`/api/aphasie/${itemId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            quote: data.quote || '',
            meaning: data.meaning || '',
            date: data.date || '',
            comment: data.comment || '',
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de l\'item');
        });
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentUser) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    const itemData = {
      quote: formData.quote,
      meaning: formData.meaning,
      date: formData.date || null,
      comment: formData.comment || null,
      userId: currentUser.id,
    };

    try {
      const url = itemId ? `/api/aphasie/${itemId}` : '/api/aphasie';
      const method = itemId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'enregistrement de l\'item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/aphasie/${itemId}`, {
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
      setError('Erreur lors de la suppression de l\'item');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} />

      <InputWithSpeech
        label="Citation"
        type="text"
        required
        value={formData.quote}
        onValueChange={(value) => setFormData({ ...formData, quote: value })}
      />

      <InputWithSpeech
        label="Signification"
        type="text"
        required
        value={formData.meaning}
        onValueChange={(value) => setFormData({ ...formData, meaning: value })}
      />

      <InputWithSpeech
        label="Date"
        type="text"
        value={formData.date}
        onValueChange={(value) => setFormData({ ...formData, date: value })}
        placeholder="ex: Octobre 2025"
      />

      <TextareaWithSpeech
        label="Commentaire"
        rows={3}
        value={formData.comment}
        onValueChange={(value) => setFormData({ ...formData, comment: value })}
      />

      <FormActions
        loading={loading}
        onSubmitLabel={itemId ? 'Modifier' : 'Créer'}
        onCancel={onCancel}
        showDelete={!!itemId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer l'item"
        deleteConfirmLabel="⚠️ Confirmer la suppression"
      />
    </form>
  );
}

