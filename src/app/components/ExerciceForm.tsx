'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { TextareaWithSpeech, InputWithSpeech } from '@/app/components/ui';
import { ErrorMessage, FormActions, Loader } from '@/app/components';
import { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_LABELS, CATEGORY_COLORS, BODYPART_COLORS, AVAILABLE_BODYPARTS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { CheckIcon } from '@/app/components/ui/icons';

type Props = {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: ExerciceCategory;
};

export default function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    descriptionText: '',
    descriptionComment: '',
    workoutRepeat: '',
    workoutSeries: '',
    workoutDuration: '',
    category: (initialCategory || 'UPPER_BODY') as ExerciceCategory,
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
    fetch('/api/metadata', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setEquipmentsList(data.equipments || []);
      })
      .catch(() => {});

    if (exerciceId && effectiveUser) {
      // Charger l'exercice existant
      fetch(`/api/exercices/${exerciceId}?userId=${effectiveUser.id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || '',
            descriptionText: data.description?.text || '',
            descriptionComment: data.description?.comment || '',
            workoutRepeat: data.workout?.repeat || '',
            workoutSeries: data.workout?.series || '',
            workoutDuration: data.workout?.duration || '',
            category: data.category || 'UPPER_BODY',
            bodyparts: data.bodyparts || [],
            equipments: data.equipments || [],
          });
        })
        .catch(() => {
          setError('Erreur lors du chargement de l\'exercice');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [exerciceId, effectiveUser]);

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
    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom de l\'exercice est obligatoire');
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
        repeat: formData.workoutRepeat || null,
        series: formData.workoutSeries || null,
        duration: formData.workoutDuration || null,
      },
      category: formData.category,
      bodyparts: formData.bodyparts,
      equipments: formData.equipments,
      userId: effectiveUser.id,
    };

    try {
      const url = exerciceId ? `/api/exercices/${exerciceId}` : '/api/exercices';
      const method = exerciceId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(exerciceData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
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

    if (!effectiveUser) {
      setError('Utilisateur non défini');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/exercices/${exerciceId}?userId=${effectiveUser.id}`, {
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
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'exercice');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const categories: ExerciceCategory[] = CATEGORY_ORDER;

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
        <label className="block text-base font-semibold text-gray-800 mb-3">
          Catégorie *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {categories.map((category) => {
            const isSelected = formData.category === category;
            const colors = CATEGORY_COLORS[category];
            
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFormData({ ...formData, category })}
                className={`
                  flex items-center justify-center p-4 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${colors.bg} ${colors.text}
                  ${isSelected 
                    ? `border-2 ${colors.border} shadow-md scale-[1.02] font-bold` 
                    : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
                aria-pressed={isSelected}
              >
                <span className={isSelected ? 'font-semibold text-sm' : 'font-medium text-sm'}>
                  {CATEGORY_LABELS[category]}
                </span>
                {isSelected && (
                  <CheckIcon className="w-4 h-4 ml-2" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection des parties du corps */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Parties du corps ciblées
        </label>
        <p className="text-sm text-gray-500 mb-4">Sélectionnez une ou plusieurs parties du corps (optionnel)</p>
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
                  px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
                  ${colorClass}
                  ${isSelected 
                    ? 'border-2 border-gray-400 shadow-md font-semibold' 
                    : 'border border-transparent font-medium hover:shadow-sm hover:border-gray-200'
                  }
                `}
              >
                {bodypart}
                {isSelected && (
                  <CheckIcon className="inline-block w-3.5 h-3.5 ml-1" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <InputWithSpeech
        label="Nom de l'exercice"
        required
        placeholder="Ex: Montée de genoux"
        value={formData.name}
        onValueChange={(value) => setFormData({ ...formData, name: value })}
      />

      <TextareaWithSpeech
        label="Description (optionnel)"
        rows={4}
        placeholder="Décrivez comment réaliser l'exercice..."
        value={formData.descriptionText}
        onValueChange={(value) => setFormData({ ...formData, descriptionText: value })}
      />

      <InputWithSpeech
        label="Conseil ou note (optionnel)"
        placeholder="Ajoutez un conseil ou une remarque..."
        value={formData.descriptionComment}
        onValueChange={(value) => setFormData({ ...formData, descriptionComment: value })}
      />

      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-base font-semibold text-gray-800 mb-4">
          Paramètres de l&apos;exercice (optionnel)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithSpeech
            label="Répétitions"
            placeholder="Ex: 10"
            value={formData.workoutRepeat}
            onValueChange={(value) => setFormData({ ...formData, workoutRepeat: value })}
          />

          <InputWithSpeech
            label="Séries"
            placeholder="Ex: 3"
            value={formData.workoutSeries}
            onValueChange={(value) => setFormData({ ...formData, workoutSeries: value })}
          />

          <InputWithSpeech
            label="Durée"
            placeholder="Ex: 30 secondes"
            value={formData.workoutDuration}
            onValueChange={(value) => setFormData({ ...formData, workoutDuration: value })}
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-base font-semibold text-gray-800 mb-4">
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
                  px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
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
        <div className="flex flex-col sm:flex-row gap-2">
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
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium sm:w-auto w-full cursor-pointer"
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
