'use client';

import { useState, useEffect } from 'react';

interface TacheFormProps {
  tacheId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TacheForm({ tacheId, onSuccess, onCancel }: TacheFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    identifier: '',
    password: '',
    isMonthly: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (tacheId) {
      fetch(`/api/taches/${tacheId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title || '',
            url: data.url || '',
            identifier: data.identifier || '',
            password: data.password || '',
            isMonthly: data.isMonthly || false,
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de la tâche');
        });
    }
  }, [tacheId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const tacheData = {
      title: formData.title,
      url: formData.url,
      identifier: formData.identifier,
      password: formData.password,
      isMonthly: formData.isMonthly,
    };

    try {
      const url = tacheId ? `/api/taches/${tacheId}` : '/api/taches';
      const method = tacheId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tacheData),
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
      const response = await fetch(`/api/taches/${tacheId}`, {
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
      setError('Erreur lors de la suppression de la tâche');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ex: Déclaration Simona - France Travail"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL du site *
        </label>
        <input
          type="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Identifiant *
        </label>
        <input
          type="text"
          required
          value={formData.identifier}
          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe *
        </label>
        <input
          type="text"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isMonthly}
            onChange={(e) => setFormData({ ...formData, isMonthly: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            À faire tous les mois
          </span>
        </label>
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement...' : tacheId ? 'Modifier' : 'Créer'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          )}
        </div>

        {tacheId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-300'
            }`}
          >
            {showDeleteConfirm ? '⚠️ Confirmer la suppression' : 'Supprimer la tâche'}
          </button>
        )}
      </div>
    </form>
  );
}

