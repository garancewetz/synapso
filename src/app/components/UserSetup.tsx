'use client';

import { useState, memo, useCallback } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Loader } from '@/app/components/ui/Loader';
import { Logo } from '@/app/components/ui/Logo';
import { ToggleButtonGroup } from '@/app/components/ui/ToggleButtonGroup';
import { Card } from '@/app/components/ui/Card';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  userId: number;
  onComplete: () => void;
};

type ResetFrequency = 'DAILY' | 'WEEKLY';
type DominantHand = 'LEFT' | 'RIGHT';

/**
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
export const UserSetup = memo(function UserSetup({ userId, onComplete }: Props) {
  const { refreshUser } = useUser();
  const [resetFrequency, setResetFrequency] = useState<ResetFrequency>('DAILY');
  const [dominantHand, setDominantHand] = useState<DominantHand>('RIGHT');
  const [hasJournal, setHasJournal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveAndStart = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          resetFrequency, 
          dominantHand, 
          hasJournal 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      // Recharger l'utilisateur pour avoir les nouvelles valeurs
      await refreshUser();
      
      // Rediriger vers l'application
      onComplete();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la configuration');
      setLoading(false);
    }
  }, [userId, resetFrequency, dominantHand, hasJournal, refreshUser, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={80} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Personnalise ton espace</h1>
          <p className="text-gray-600">Quelques questions pour adapter l&apos;application à tes besoins</p>
        </div>

        {/* Formulaire */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Section Préférence de main */}
          <Card variant="default" padding="lg">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Préférence de main
            </label>
            <p className="text-sm text-gray-500 mb-4">
              On positionnera les boutons principaux du bon côté pour toi
            </p>

            <ToggleButtonGroup
              options={[
                { value: 'LEFT', label: 'Gauche', icon: '🤚' },
                { value: 'RIGHT', label: 'Droite', icon: '✋' },
              ]}
              value={dominantHand}
              onChange={(value) => setDominantHand(value as DominantHand)}
              activeColor="amber"
            />
          </Card>

          {/* Section Rythme */}
          <Card variant="default" padding="lg">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Réinitialisation des exercices
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Les exercices complétés seront réinitialisés selon ce rythme
            </p>

            <ToggleButtonGroup
              options={[
                { value: 'DAILY', label: 'Tous les jours' },
                { value: 'WEEKLY', label: 'Une fois par semaine' },
              ]}
              value={resetFrequency}
              onChange={(value) => setResetFrequency(value as ResetFrequency)}
              activeColor="amber"
            />
            <div className="mt-3 text-sm text-gray-500">
              {resetFrequency === 'DAILY' && (
                <p>Les exercices complétés sont réinitialisés chaque jour à minuit</p>
              )}
              {resetFrequency === 'WEEKLY' && (
                <p>Les exercices complétés sont réinitialisés chaque lundi à minuit</p>
              )}
            </div>
          </Card>

          {/* Section Journal */}
          <Card variant="default" padding="lg">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Journal
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Pour suivre tes tâches et prendre des notes
            </p>

            <ToggleButtonGroup
              options={[
                { value: true, label: 'Oui', icon: '✓' },
                { value: false, label: 'Non', icon: '✗' },
              ]}
              value={hasJournal}
              onChange={(value) => setHasJournal(value as boolean)}
              activeColor="purple"
            />
          </Card>

          {/* Bouton */}
          <Button
            type="button"
            onClick={handleSaveAndStart}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size="small" />
                <span>Sauvegarde...</span>
              </span>
            ) : (
              'Sauvegarder et commencer'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

