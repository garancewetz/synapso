'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Loader } from '@/app/components/ui/Loader';
import { Logo } from '@/app/components/ui/Logo';
import { SegmentedControl } from '@/app/components/ui/SegmentedControl';
import { Card } from '@/app/components/ui/Card';
import { useUser } from '@/app/contexts/UserContext';
import clsx from 'clsx';

type Props = {
  userId: number;
  onComplete: () => void;
  onSkip: () => void;
};

type ResetFrequency = 'DAILY' | 'WEEKLY';
type DominantHand = 'LEFT' | 'RIGHT';

export function UserSetup({ userId, onComplete, onSkip }: Props) {
  const { refreshUser } = useUser();
  const [resetFrequency, setResetFrequency] = useState<ResetFrequency>('DAILY');
  const [dominantHand, setDominantHand] = useState<DominantHand>('RIGHT');
  const [isAphasic, setIsAphasic] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          isAphasic 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      // Recharger l'utilisateur pour avoir les nouvelles valeurs
      await refreshUser();
      
      onComplete();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Section Préférence de main */}
          <Card variant="default" padding="lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Quelle est ta main dominante ?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              On positionnera les boutons principaux du bon côté pour toi
            </p>
            
            <SegmentedControl
              options={[
                { value: 'LEFT', label: '🤚 Gauche' },
                { value: 'RIGHT', label: '✋ Droite' },
              ]}
              value={dominantHand}
              onChange={(value) => setDominantHand(value as DominantHand)}
              fullWidth
              size="md"
              variant="filter"
              className="bg-gray-50 border-2 border-gray-200"
              activeRingColor="ring-amber-400"
            />
          </Card>

          {/* Section Rythme */}
          <Card variant="default" padding="lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              À quel rythme veux-tu faire tes exercices ?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Les exercices complétés seront réinitialisés selon ce rythme
            </p>
            
            <div className="space-y-3">
              <label className={clsx(
                'flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all',
                resetFrequency === 'DAILY' 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              )}>
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
                    Les exercices se réinitialisent chaque jour à minuit
                  </div>
                </div>
              </label>

              <label className={clsx(
                'flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 cursor-pointer transition-all',
                resetFrequency === 'WEEKLY' 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-200 hover:border-amber-300'
              )}>
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
                    Les exercices se réinitialisent chaque dimanche à minuit
                  </div>
                </div>
              </label>
            </div>
          </Card>

          {/* Section Aphasie */}
          <Card variant="default" padding="lg">
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Souhaites-tu accéder au journal d&apos;aphasie ?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Pour suivre tes citations et pratiquer des exercices d&apos;orthophonie
            </p>
            
            <SegmentedControl
              options={[
                { value: 'YES', label: '✓ Oui' },
                { value: 'NO', label: '✗ Non' },
              ]}
              value={isAphasic ? 'YES' : 'NO'}
              onChange={(value) => setIsAphasic(value === 'YES')}
              fullWidth
              size="md"
              variant="filter"
              className="bg-gray-50 border-2 border-gray-200"
              activeRingColor="ring-purple-500"
            />
          </Card>

          {/* Boutons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size="small" />
                  <span>Configuration...</span>
                </span>
              ) : (
                'Continuer'
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onSkip}
              disabled={loading}
              className="px-6"
            >
              Passer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

