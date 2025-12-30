'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';

import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ErrorMessage from '@/app/components/ErrorMessage';
import Loader from '@/app/components/ui/Loader';
import FormPageWrapper from '@/app/components/FormPageWrapper';

type ResetFrequency = 'DAILY' | 'WEEKLY';
type DominantHand = 'LEFT' | 'RIGHT';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, refreshUsers } = useUser();
  // Pré-remplir avec le nom de l'utilisateur courant immédiatement
  const [name, setName] = useState(currentUser?.name || '');
  const [resetFrequency, setResetFrequency] = useState<ResetFrequency>(
    (currentUser?.resetFrequency as ResetFrequency) || 'DAILY'
  );
  const [dominantHand, setDominantHand] = useState<DominantHand>(
    (currentUser?.dominantHand as DominantHand) || 'RIGHT'
  );
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Pré-remplir avec les données du contexte immédiatement
      setName(currentUser.name || '');
      if (currentUser.resetFrequency) {
        setResetFrequency(currentUser.resetFrequency as ResetFrequency);
      }
      if (currentUser.dominantHand) {
        setDominantHand(currentUser.dominantHand as DominantHand);
      }
      
      // Charger les paramètres complets depuis l'API (pour être sûr d'avoir les dernières valeurs)
      fetch(`/api/users/${currentUser.id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.name) {
            setName(data.name);
          }
          if (data.resetFrequency) {
            setResetFrequency(data.resetFrequency);
          }
          if (data.dominantHand) {
            setDominantHand(data.dominantHand);
          }
          setInitialLoading(false);
        })
        .catch((err) => {
          console.error('Erreur lors du chargement des paramètres:', err);
          setInitialLoading(false);
        });
    }
  }, [currentUser]);

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
        body: JSON.stringify({ name, resetFrequency, dominantHand }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();
      
      // Mettre à jour l'utilisateur courant avec le nouveau nom
      setCurrentUser(updatedUser);
      await refreshUsers();
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <FormPageWrapper title="Paramètres">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="large" />
        </div>
      </FormPageWrapper>
    );
  }

  if (!currentUser) {
    return (
      <FormPageWrapper title="Paramètres">
        <div className="text-center py-8">
          <p className="text-gray-500">Veuillez sélectionner un utilisateur</p>
        </div>
      </FormPageWrapper>
    );
  }

  return (
    <FormPageWrapper title="Paramètres utilisateur">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage message={error} />
        
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-emerald-700 text-sm font-medium">
              ✓ Paramètres enregistrés avec succès
            </p>
          </div>
        )}

        {/* Section Nom */}
        <div className="bg-gray-50 rounded-lg p-4">
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

        {/* Section Main dominante */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Main dominante
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Choisissez votre main dominante pour positionner le bouton &quot;Victoire&quot; du bon côté
          </p>
          
          <div className="flex bg-white rounded-xl p-1 border-2 border-gray-200">
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

        {/* Section Réinitialisation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-base font-semibold text-gray-800 mb-4">
            Réinitialisation des exercices
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Choisissez la fréquence de réinitialisation des exercices complétés
          </p>
          
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 cursor-pointer transition-all hover:border-purple-300">
              <input
                type="radio"
                name="resetFrequency"
                value="DAILY"
                checked={resetFrequency === 'DAILY'}
                onChange={(e) => setResetFrequency(e.target.value as ResetFrequency)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Tous les jours</div>
                <div className="text-sm text-gray-500 mt-1">
                  Les exercices complétés sont réinitialisés chaque jour à minuit
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 cursor-pointer transition-all hover:border-purple-300">
              <input
                type="radio"
                name="resetFrequency"
                value="WEEKLY"
                checked={resetFrequency === 'WEEKLY'}
                onChange={(e) => setResetFrequency(e.target.value as ResetFrequency)}
                className="mt-1"
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
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader size="small" />
                <span>Enregistrement...</span>
              </>
            ) : (
              'Enregistrer les paramètres'
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </FormPageWrapper>
  );
}

