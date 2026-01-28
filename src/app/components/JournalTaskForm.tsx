'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage, FormActions } from '@/app/components';
import { InputWithSpeech } from '@/app/components/ui';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  taskId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function JournalTaskForm({ taskId, onSuccess, onCancel }: Props) {
  const { effectiveUser } = useUser();
  const [formData, setFormData] = useState({
    title: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetch(`/api/journal/tasks/${taskId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title || '',
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de la tâche');
        });
    }
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!effectiveUser) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    const taskData = {
      title: formData.title,
      userId: effectiveUser.id,
    };

    try {
      const url = taskId ? `/api/journal/tasks/${taskId}` : '/api/journal/tasks';
      const method = taskId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'enregistrement de la tâche');
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
      const response = await fetch(`/api/journal/tasks/${taskId}`, {
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
      setError('Erreur lors de la suppression de la tâche');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
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
      />

      <FormActions
        loading={loading}
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

