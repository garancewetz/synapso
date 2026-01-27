'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { TextareaWithSpeech, InputWithSpeech } from '@/app/components/ui';
import { ErrorMessage, FormActions, Loader } from '@/app/components';
import { ExerciceCategory, type MediaData } from '@/app/types/exercice';
import { CATEGORY_LABELS_SHORT, CATEGORY_COLORS, CATEGORY_ICONS, BODYPART_COLORS, AVAILABLE_BODYPARTS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { CheckIcon } from '@/app/components/ui/icons';
import { useAllEquipments } from '@/app/hooks/useAllEquipments';
import { MediaUploader } from '@/app/components/MediaUploader';
import clsx from 'clsx';

type Props = {
  exerciceId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialCategory?: ExerciceCategory;
};

export function ExerciceForm({ exerciceId, onSuccess, onCancel, initialCategory }: Props) {
  const { effectiveUser } = useUser();
  const { equipments: allEquipments, equipmentIconsMap, loading: loadingEquipments } = useAllEquipments();
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
    media: null as MediaData | null,
  });
  const [newEquipment, setNewEquipment] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!exerciceId);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
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
            media: data.media || null,
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
    const trimmedEquipment = newEquipment.trim();
    if (trimmedEquipment && !formData.equipments.includes(trimmedEquipment)) {
      setFormData((prev) => ({
        ...prev,
        equipments: [...prev.equipments, trimmedEquipment],
      }));
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
      media: formData.media,
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-full">
          {categories.map((category) => {
            const isSelected = formData.category === category;
            const colors = CATEGORY_COLORS[category];
            const icon = CATEGORY_ICONS[category];
            
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFormData({ ...formData, category })}
                className={clsx(
                  'p-5 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  colors.focusRing,
                  'active:scale-[0.98]',
                  colors.bg,
                  colors.cardBorder,
                  isSelected 
                    ? clsx(colors.border, 'ring-2 ring-offset-2', colors.focusRing.replace('focus:', 'ring-'))
                    : 'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
                )}
                aria-pressed={isSelected}
              >
                <div className="text-3xl md:text-4xl mb-2">{icon}</div>
                <div className={clsx('text-sm md:text-base font-medium', colors.text)}>
                  {CATEGORY_LABELS_SHORT[category]}
                </div>
                {isSelected && (
                  <CheckIcon className="w-5 h-5 mt-2" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection des parties du corps */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Parties du corps ciblées
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
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                  'active:scale-[0.98]',
                  colorClass,
                  isSelected 
                    ? 'border-2 border-gray-400 ring-2 ring-offset-2 ring-gray-400 font-semibold' 
                    : 'border border-transparent font-medium md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
                )}
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

      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        <label className="block text-base font-semibold text-gray-800 mb-4">
          Paramètres de l&apos;exercice (optionnel)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
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

      <div className="bg-gray-50 rounded-lg p-4 md:p-6">
        <label className="block text-base font-semibold text-gray-800 mb-4">
          Équipements (optionnel)
        </label>
        <p className="text-sm text-gray-500 mb-4">Sélectionnez un ou plusieurs équipements (optionnel)</p>
        
        {/* Liste de tous les équipements disponibles */}
        {loadingEquipments ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="small" />
          </div>
        ) : allEquipments.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {allEquipments.map((equipmentName) => {
              const isSelected = formData.equipments.includes(equipmentName);
              const icon = equipmentIconsMap[equipmentName];
              return (
                <button
                  key={equipmentName}
                  type="button"
                  onClick={() => toggleEquipment(equipmentName)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'flex items-center gap-2 min-w-0',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                    'active:scale-[0.98]',
                    isSelected
                      ? 'bg-gray-800 text-white ring-2 ring-offset-2 ring-gray-400'
                      : 'bg-white text-gray-700 border border-gray-200 md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
                  )}
                  aria-label={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${equipmentName}`}
                  aria-pressed={isSelected}
                >
                  <span className="text-base">{icon}</span>
                  <span className="flex-1 text-left truncate">{equipmentName}</span>
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4 mb-4">
            Aucun équipement disponible pour le moment
          </p>
        )}

        {/* Champ pour ajouter un nouvel équipement */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Ajouter un nouvel équipement :
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Nom de l'équipement..."
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewEquipment();
                }
              }}
              className="px-4 h-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Nom du nouvel équipement"
            />
            <button
              type="button"
              onClick={addNewEquipment}
              disabled={!newEquipment.trim()}
              className={clsx(
                'px-4 h-10 rounded-lg transition-colors font-medium sm:w-auto w-full',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                newEquipment.trim()
                  ? 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <MediaUploader
        value={formData.media}
        onChange={(media) => setFormData({ ...formData, media })}
      />

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
