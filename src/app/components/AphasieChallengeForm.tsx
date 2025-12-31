'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech } from '@/app/components/ui';
import { useUser } from '@/app/contexts/UserContext';

interface AphasieChallengeFormProps {
  challengeId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AphasieChallengeForm({ challengeId, onSuccess, onCancel }: AphasieChallengeFormProps) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    text: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (challengeId) {
      fetch(`/api/aphasie-challenges/${challengeId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            text: data.text || '',
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement du challenge');
        });
    }
  }, [challengeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!currentUser) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    const challengeData = {
      text: formData.text,
      userId: currentUser.id,
    };

    try {
      const url = challengeId ? `/api/aphasie-challenges/${challengeId}` : '/api/aphasie-challenges';
      const method = challengeId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'enregistrement du challenge');
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
      const response = await fetch(`/api/aphasie-challenges/${challengeId}`, {
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
      setError('Erreur lors de la suppression du challenge');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} />

      <InputWithSpeech
        label="Bout de phrase ou mot difficile"
        type="text"
        required
        value={formData.text}
        onValueChange={(value) => setFormData({ ...formData, text: value })}
      />

      <FormActions
        loading={loading}
        onSubmitLabel={challengeId ? 'Modifier' : 'Créer'}
        onCancel={onCancel}
        showDelete={!!challengeId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer le challenge"
        deleteConfirmLabel="⚠️ Confirmer la suppression"
      />
    </form>
  );
}

