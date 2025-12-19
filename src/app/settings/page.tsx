'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

import Button from '@/app/components/atoms/Button';
import ErrorMessage from '@/app/components/atoms/ErrorMessage';
import Loader from '@/app/components/atoms/Loader';
import FormPageWrapper from '@/app/components/organisms/FormPageWrapper';

type ResetFrequency = 'DAILY' | 'WEEKLY';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, refreshUsers } = useUser();
  const [resetFrequency, setResetFrequency] = useState<ResetFrequency>('DAILY');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Charger les paramètres de l'utilisateur
      fetch(`/api/users/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.resetFrequency) {
            setResetFrequency(data.resetFrequency);
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
        body: JSON.stringify({ resetFrequency }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

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

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-base font-semibold text-gray-900 mb-4">
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
                <div className="font-medium text-gray-900">Tous les jours</div>
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
                <div className="font-medium text-gray-900">Une fois par semaine</div>
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
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </FormPageWrapper>
  );
}

