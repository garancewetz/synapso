'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from '@/types';
import { useUser } from '@/contexts/UserContext';
import Input from '@/app/components/atoms/Input';
import Textarea from '@/app/components/atoms/Textarea';
import ErrorMessage from '@/app/components/atoms/ErrorMessage';
import FormActions from '@/app/components/molecules/FormActions';

interface ExerciceFormProps {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExerciceForm({ exerciceId, onSuccess, onCancel }: ExerciceFormProps) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    descriptionText: '',
    descriptionComment: '',
    workoutRepeat: '',
    workoutSeries: '',
    workoutDuration: '',
    equipments: [] as string[],
    bodyparts: [] as string[],
  });
  const [metadata, setMetadata] = useState<Metadata>({ bodyparts: [], equipments: [] });
  const [newBodypart, setNewBodypart] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Charger les métadonnées
    fetch('/api/metadata')
      .then((res) => res.json())
      .then((data) => {
        setMetadata(data);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des métadonnées:', err);
      });

    if (exerciceId && currentUser) {
      // Charger l'exercice existant
      fetch(`/api/exercices/${exerciceId}?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || '',
            descriptionText: data.description?.text || '',
            descriptionComment: data.description?.comment || '',
            workoutRepeat: data.workout?.repeat?.toString() || '',
            workoutSeries: data.workout?.series?.toString() || '',
            workoutDuration: data.workout?.duration || '',
            equipments: data.equipments || [],
            bodyparts: data.bodyparts ? data.bodyparts.map((bp: { name: string }) => bp.name) : [],
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de l&apos;exercice');
        });
    }
  }, [exerciceId, currentUser]);

  const toggleBodypart = (bodypart: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyparts: prev.bodyparts.includes(bodypart)
        ? prev.bodyparts.filter((bp) => bp !== bodypart)
        : [...prev.bodyparts, bodypart],
    }));
  };

  const toggleEquipment = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipments: prev.equipments.includes(equipment)
        ? prev.equipments.filter((eq) => eq !== equipment)
        : [...prev.equipments, equipment],
    }));
  };

  const addNewBodypart = () => {
    if (newBodypart && !formData.bodyparts.includes(newBodypart)) {
      setFormData((prev) => ({
        ...prev,
        bodyparts: [...prev.bodyparts, newBodypart],
      }));
      setMetadata((prev) => ({
        ...prev,
        bodyparts: [...prev.bodyparts, newBodypart].sort(),
      }));
      setNewBodypart('');
    }
  };

  const addNewEquipment = () => {
    if (newEquipment && !formData.equipments.includes(newEquipment)) {
      setFormData((prev) => ({
        ...prev,
        equipments: [...prev.equipments, newEquipment],
      }));
      setMetadata((prev) => ({
        ...prev,
        equipments: [...prev.equipments, newEquipment].sort(),
      }));
      setNewEquipment('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Utilisateur non défini');
      return;
    }
    
    setLoading(true);
    setError('');

    const exerciceData = {
      name: formData.name,
      description: {
        text: formData.descriptionText,
        comment: formData.descriptionComment || null,
      },
      workout: {
        repeat: formData.workoutRepeat ? parseInt(formData.workoutRepeat) : null,
        series: formData.workoutSeries ? parseInt(formData.workoutSeries) : null,
        duration: formData.workoutDuration || null,
      },
      equipments: formData.equipments,
      bodyparts: formData.bodyparts,
      userId: currentUser.id,
    };

    try {
      const url = exerciceId ? `/api/exercices/${exerciceId}` : '/api/exercices';
      const method = exerciceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciceData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'enregistrement de l\'exercice');
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
      setError('Utilisateur non défini');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/exercices/${exerciceId}?userId=${currentUser.id}`, {
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
      setError('Erreur lors de la suppression de l\'exercice');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} />

      <Input
        label="Nom de l'exercice"
        type="text"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Textarea
        label="Description"
        required
        rows={3}
        value={formData.descriptionText}
        onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
      />

      <Input
        label="Commentaire"
        type="text"
        value={formData.descriptionComment}
        onChange={(e) => setFormData({ ...formData, descriptionComment: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Répétitions"
          type="number"
          value={formData.workoutRepeat}
          onChange={(e) => setFormData({ ...formData, workoutRepeat: e.target.value })}
        />

        <Input
          label="Séries"
          type="number"
          value={formData.workoutSeries}
          onChange={(e) => setFormData({ ...formData, workoutSeries: e.target.value })}
        />

        <Input
          label="Durée"
          type="text"
          placeholder="ex: 120 secondes"
          value={formData.workoutDuration}
          onChange={(e) => setFormData({ ...formData, workoutDuration: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parties du corps
        </label>
        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {metadata.bodyparts.map((bodypart) => (
              <label key={bodypart} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bodyparts.includes(bodypart)}
                  onChange={() => toggleBodypart(bodypart)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{bodypart}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <input
              type="text"
              placeholder="Ajouter une nouvelle partie..."
              value={newBodypart}
              onChange={(e) => setNewBodypart(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewBodypart())}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addNewBodypart}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Équipements
        </label>
        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {metadata.equipments.map((equipment) => (
              <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.equipments.includes(equipment)}
                  onChange={() => toggleEquipment(equipment)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{equipment}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <input
              type="text"
              placeholder="Ajouter un nouvel équipement..."
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewEquipment())}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addNewEquipment}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <FormActions
        loading={loading}
        onSubmitLabel={exerciceId ? 'Modifier' : 'Créer'}
        onCancel={onCancel}
        showDelete={!!exerciceId}
        onDelete={handleDelete}
        deleteConfirm={showDeleteConfirm}
        deleteLabel="Supprimer l'exercice"
        deleteConfirmLabel="⚠️ Confirmer la suppression"
      />
    </form>
  );
}

