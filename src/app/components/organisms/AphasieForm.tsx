'use client';

import { useState, useEffect } from 'react';
import Input from '@/app/components/atoms/Input';
import Textarea from '@/app/components/atoms/Textarea';
import ErrorMessage from '@/app/components/atoms/ErrorMessage';
import FormActions from '@/app/components/molecules/FormActions';

interface AphasieFormProps {
  itemId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AphasieForm({ itemId, onSuccess, onCancel }: AphasieFormProps) {
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
      fetch(`/api/aphasie/${itemId}`)
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

    const itemData = {
      quote: formData.quote,
      meaning: formData.meaning,
      date: formData.date || null,
      comment: formData.comment || null,
    };

    try {
      const url = itemId ? `/api/aphasie/${itemId}` : '/api/aphasie';
      const method = itemId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
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

      <Input
        label="Citation"
        type="text"
        required
        value={formData.quote}
        onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
      />

      <Input
        label="Signification"
        type="text"
        required
        value={formData.meaning}
        onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
      />

      <Input
        label="Date"
        type="text"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        placeholder="ex: Octobre 2025"
      />

      <Textarea
        label="Commentaire"
        rows={3}
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
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

