'use client';

import { useState } from 'react';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import ConfettiRain from '@/app/components/ConfettiRain';
import AphasieChallengeCard from '@/app/components/AphasieChallengeCard';
import { useAphasieChallenges } from '@/app/hooks/useAphasieChallenges';

type Props = {
  onMasteredChange?: () => void;
  limit?: number;
  showViewAll?: boolean;
};

export default function AphasieChallengesList({ onMasteredChange, limit }: Props) {
  const { challenges, refetch: refetchChallenges } = useAphasieChallenges();
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleMasteredToggle = async (id: number, currentMastered: boolean) => {
    const wasNotMastered = !currentMastered;
    setIsUpdating(id);
    try {
      const response = await fetch(`/api/aphasie-challenges/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mastered: !currentMastered }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Déclencher le confetti si le challenge vient d'être maîtrisé
      if (wasNotMastered) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3200);
      }

      refetchChallenges();
      if (onMasteredChange) {
        onMasteredChange();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Garder l'ordre original des challenges (pas de tri)
  const displayedChallenges = limit ? challenges.slice(0, limit) : challenges;
  const hasMoreTotal = limit && challenges.length > limit;

  return (
    <>
      <ConfettiRain 
        show={showConfetti} 
        fromWindow={true}
      />
      <div>
        {displayedChallenges.length > 0 ? (
          <>
            <ul className="space-y-3">
              {displayedChallenges.map(challenge => (
                <AphasieChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onMasteredToggle={handleMasteredToggle}
                  isUpdating={isUpdating === challenge.id}
                />
              ))}
            </ul>
            {limit && hasMoreTotal && (
              <div className="mt-4">
                <ViewAllLink 
                  href="/aphasie/exercices"
                  label="Voir tous les exercices"
                  emoji="🎯"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Aucun exercice pour le moment
          </div>
        )}
      </div>
    </>
  );
}

export function useAphasieChallengesCount() {
  const { challenges } = useAphasieChallenges();
  return challenges.length;
}

