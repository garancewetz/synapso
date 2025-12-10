'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Input from '@/app/components/atoms/Input';
import Textarea from '@/app/components/atoms/Textarea';
import ErrorMessage from '@/app/components/atoms/ErrorMessage';
import FormActions from '@/app/components/molecules/FormActions';
import Loader from '@/app/components/atoms/Loader';
import { ExerciceCategory, CATEGORY_LABELS, CATEGORY_COLORS, BODYPART_COLORS } from '@/types/exercice';

interface ExerciceFormProps {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Liste des bodyparts disponibles
const AVAILABLE_BODYPARTS = [
  'Jambes',
  'Bassin',
  'Bras',
  'Mains',
  'Épaules',
  'Dos',
  'Nuque / Cervicales',
  'Pied',
  'Fessier',
];

export default function ExerciceForm({ exerciceId, onSuccess, onCancel }: ExerciceFormProps) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    descriptionText: '',
    descriptionComment: '',
    workoutRepeat: '',
    workoutSeries: '',
    workoutDuration: '',
    category: 'UPPER_BODY' as ExerciceCategory,
    bodyparts: [] as string[],
    equipments: [] as string[],
  });
  const [equipmentsList, setEquipmentsList] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!exerciceId);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Charger la liste des équipements existants
    fetch('/api/metadata')
      .then((res) => res.json())
      .then((data) => {
        setEquipmentsList(data.equipments || []);
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des équipements:', err);
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
            category: data.category || 'UPPER_BODY',
            bodyparts: data.bodyparts || [],
            equipments: data.equipments || [],
          });
        })
        .catch((err) => {
          console.error('Erreur lors du chargement:', err);
          setError('Erreur lors du chargement de l\'exercice');
        })
        .finally(() => {
          setInitialLoading(false);
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

  const addNewEquipment = () => {
    if (newEquipment && !formData.equipments.includes(newEquipment)) {
      setFormData((prev) => ({
        ...prev,
        equipments: [...prev.equipments, newEquipment],
      }));
      setEquipmentsList((prev) => [...new Set([...prev, newEquipment])].sort());
      setNewEquipment('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Utilisateur non défini');
      return;
    }

    if (formData.bodyparts.length === 0) {
      setError('Sélectionnez au moins une partie du corps');
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
      category: formData.category,
      bodyparts: formData.bodyparts,
      equipments: formData.equipments,
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

  const categories: ExerciceCategory[] = ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ErrorMessage message={error} />

      {/* Sélection de catégorie */}
      <div>
        <label className="block text-base font-semibold text-gray-900 mb-3">
          Catégorie *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((category) => {
            const isSelected = formData.category === category;
            const colors = CATEGORY_COLORS[category];
            
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFormData({ ...formData, category })}
                className={`
                  flex items-center justify-center p-4 rounded-lg border-2 
                  transition-all duration-200
                  ${isSelected 
                    ? `${colors.bg} ${colors.border} ${colors.text}` 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
                aria-pressed={isSelected}
              >
                <span className="font-medium text-sm">{CATEGORY_LABELS[category]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection des parties du corps */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-base font-semibold text-gray-900 mb-2">
          Parties du corps ciblées *
        </label>
        <p className="text-sm text-gray-500 mb-4">Sélectionnez une ou plusieurs parties du corps</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_BODYPARTS.map((bodypart) => {
            const isSelected = formData.bodyparts.includes(bodypart);
            const colorClass = BODYPART_COLORS[bodypart] || 'bg-gray-100 text-gray-600';
            
            return (
              <button
                key={bodypart}
                type="button"
                onClick={() => toggleBodypart(bodypart)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected 
                    ? `${colorClass} ring-2 ring-offset-1 ring-gray-300` 
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {bodypart}
                {isSelected && (
                  <svg className="inline-block w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {formData.bodyparts.length === 0 && (
          <p className="text-sm text-red-600 mt-2">Sélectionnez au moins une partie du corps</p>
        )}
      </div>

      <Input
        label="Nom de l'exercice *"
        type="text"
        required
        placeholder="Ex: Montée de genoux"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Textarea
        label="Description *"
        required
        rows={4}
        placeholder="Décrivez comment réaliser l'exercice..."
        value={formData.descriptionText}
        onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
      />

      <Input
        label="Conseil ou note (optionnel)"
        type="text"
        placeholder="Ajoutez un conseil ou une remarque..."
        value={formData.descriptionComment}
        onChange={(e) => setFormData({ ...formData, descriptionComment: e.target.value })}
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-base font-semibold text-gray-900 mb-4">
          Paramètres de l&apos;exercice
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Répétitions"
            type="number"
            placeholder="Ex: 10"
            value={formData.workoutRepeat}
            onChange={(e) => setFormData({ ...formData, workoutRepeat: e.target.value })}
          />

          <Input
            label="Séries"
            type="number"
            placeholder="Ex: 3"
            value={formData.workoutSeries}
            onChange={(e) => setFormData({ ...formData, workoutSeries: e.target.value })}
          />

          <Input
            label="Durée"
            type="text"
            placeholder="Ex: 30 secondes"
            value={formData.workoutDuration}
            onChange={(e) => setFormData({ ...formData, workoutDuration: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-base font-semibold text-gray-900 mb-4">
          Équipements (optionnel)
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {equipmentsList.map((equipment) => {
            const isSelected = formData.equipments.includes(equipment);
            return (
              <button
                key={equipment}
                type="button"
                onClick={() => toggleEquipment(equipment)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
                  }
                `}
              >
                {equipment}
                {isSelected && ' ✓'}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter un équipement..."
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewEquipment())}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={addNewEquipment}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            + Ajouter
          </button>
        </div>
      </div>

      <FormActions
        loading={loading}
        onSubmitLabel={exerciceId ? 'Enregistrer les modifications' : 'Créer l\'exercice'}
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
