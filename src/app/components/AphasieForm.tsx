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

export function AphasieForm({ itemId, onSuccess, onCancel }: Props) {
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
    if (itemId && currentUser) {
      fetch(`/api/aphasie/${itemId}?userId=${currentUser.id}`, { credentials: 'include' })
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
            quote: data.quote || '',
            meaning: data.meaning || '',
            date: dateValue,
            comment: data.comment || '',
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de l&apos;item');
        });
    }
  }, [itemId, currentUser]);

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
      setError('Erreur lors de l&apos;enregistrement de l&apos;item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (!currentUser) {
      setError('Utilisateur non connecté');
      setShowDeleteConfirm(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/aphasie/${itemId}?userId=${currentUser.id}`, {
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
      setError('Erreur lors de la suppression de l&apos;item');
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

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date de la citation <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Date de la citation (optionnel)"
        />
        <p className="mt-1 text-xs text-gray-500">Par défaut : date d&apos;ajout</p>
      </div>

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

