'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';

import { Button } from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ErrorMessage from '@/app/components/ErrorMessage';
import Loader from '@/app/components/ui/Loader';
import { BackButton } from '@/app/components/BackButton';

type ResetFrequency = 'DAILY' | 'WEEKLY';
type DominantHand = 'LEFT' | 'RIGHT';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser } = useUser();
  // Pré-remplir avec le nom de l'utilisateur courant immédiatement
  const [name, setName] = useState(currentUser?.name || '');
  const [resetFrequency, setResetFrequency] = useState<ResetFrequency>(
    (currentUser?.resetFrequency as ResetFrequency) || 'DAILY'
  );
  const [dominantHand, setDominantHand] = useState<DominantHand>(
    (currentUser?.dominantHand as DominantHand) || 'RIGHT'
  );
  const [isAphasic, setIsAphasic] = useState<boolean>(
    currentUser?.isAphasic ?? false
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Valeurs initiales pour détecter les changements
  const [initialValues, setInitialValues] = useState<{
    name: string;
    resetFrequency: ResetFrequency;
    dominantHand: DominantHand;
    isAphasic: boolean;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      // Utiliser directement les données du contexte (déjà chargées depuis l'API)
      const loadedName = currentUser.name || '';
      const loadedResetFrequency = (currentUser.resetFrequency as ResetFrequency) || 'DAILY';
      const loadedDominantHand = (currentUser.dominantHand as DominantHand) || 'RIGHT';
      const loadedIsAphasic = currentUser.isAphasic ?? false;
      
      setName(loadedName);
      setResetFrequency(loadedResetFrequency);
      setDominantHand(loadedDominantHand);
      setIsAphasic(loadedIsAphasic);
      
      // Sauvegarder les valeurs initiales
      setInitialValues({
        name: loadedName,
        resetFrequency: loadedResetFrequency,
        dominantHand: loadedDominantHand,
        isAphasic: loadedIsAphasic,
      });
      
      setInitialLoading(false);
    }
  }, [currentUser]);
  
  // Détecter si des changements ont été faits
  const hasUnsavedChanges = initialValues && (
    name !== initialValues.name ||
    resetFrequency !== initialValues.resetFrequency ||
    dominantHand !== initialValues.dominantHand ||
    isAphasic !== initialValues.isAphasic
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Utilisateur non défini');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, resetFrequency, dominantHand, isAphasic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      
      // Optimistic update : met à jour immédiatement le contexte et la liste
      updateCurrentUser(updatedUser);
      
      // Mettre à jour les valeurs initiales après sauvegarde
      setInitialValues({
        name: updatedUser.name || '',
        resetFrequency: (updatedUser.resetFrequency as ResetFrequency) || 'DAILY',
        dominantHand: (updatedUser.dominantHand as DominantHand) || 'RIGHT',
        isAphasic: updatedUser.isAphasic ?? false,
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="px-3 md:px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="px-3 md:px-4">
          <div className="text-center py-8">
            <p className="text-gray-500">Veuillez sélectionner un utilisateur</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      <div className="px-3 sm:px-6">
        {/* Bouton retour */}
        <BackButton className="mb-4" buttonClassName="py-3" />

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ErrorMessage message={error} />
          
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 text-sm font-medium">
                ✓ Profil enregistré avec succès
              </p>
            </div>
          )}
          
          {hasUnsavedChanges && !success && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>N&apos;oubliez pas d&apos;enregistrer vos changements</span>
              </p>
            </div>
          )}

          {/* Section Nom */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <Input
              label="Nom de l'utilisateur"
              type="text"
              required
              placeholder="Ex: Calypso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Section Préférence de main */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Préférence de main
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Choisissez votre préférence de main pour positionner les boutons principaux (menu, victoire, etc.) du bon côté
            </p>
            
            <div className="flex bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
              <button
                type="button"
                onClick={() => setDominantHand('LEFT')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  dominantHand === 'LEFT'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">🤚</span>
                <span>Gauche</span>
              </button>
              <button
                type="button"
                onClick={() => setDominantHand('RIGHT')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  dominantHand === 'RIGHT'
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>Droite</span>
                <span className="text-xl">✋</span>
              </button>
            </div>
          </div>

          {/* Section Aphasie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Journal d&apos;aphasie
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Activez cette option si vous souhaitez accéder au journal d&apos;aphasie pour suivre vos citations et exercices
            </p>
            
            <div className="flex bg-gray-50 rounded-xl p-1 border-2 border-gray-200">
              <button
                type="button"
                onClick={() => setIsAphasic(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  isAphasic
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">✓</span>
                <span>Oui</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAphasic(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  !isAphasic
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">✗</span>
                <span>Non</span>
              </button>
            </div>
          </div>

          {/* Section Réinitialisation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Réinitialisation des exercices
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Choisissez la fréquence de réinitialisation des exercices complétés
            </p>
            
            <div className="space-y-3">
              <label className={`flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${
                resetFrequency === 'DAILY' 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}>
                <input
                  type="radio"
                  name="resetFrequency"
                  value="DAILY"
                  checked={resetFrequency === 'DAILY'}
                  onChange={(e) => setResetFrequency(e.target.value as ResetFrequency)}
                  className="mt-1 w-5 h-5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Tous les jours</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Les exercices complétés sont réinitialisés chaque jour à minuit
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all ${
                resetFrequency === 'WEEKLY' 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              }`}>
                <input
                  type="radio"
                  name="resetFrequency"
                  value="WEEKLY"
                  checked={resetFrequency === 'WEEKLY'}
                  onChange={(e) => setResetFrequency(e.target.value as ResetFrequency)}
                  className="mt-1 w-5 h-5 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">Une fois par semaine</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Les exercices complétés sont réinitialisés chaque dimanche à minuit
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 ${hasUnsavedChanges ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
            >
              {loading ? (
                <>
                  <Loader size="small" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                'Enregistrer mon profil'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const shouldLeave = window.confirm('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?');
                  if (shouldLeave) {
                    router.push('/');
                  }
                } else {
                  router.push('/');
                }
              }}
              disabled={loading}
            >
              {hasUnsavedChanges ? 'Quitter' : 'Annuler'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

