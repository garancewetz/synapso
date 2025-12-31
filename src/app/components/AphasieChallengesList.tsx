'use client';

import { useState, useEffect } from 'react';
import { CompleteButton } from '@/app/components/ui';
import ViewAllLink from '@/app/components/ui/ViewAllLink';
import ConfettiRain from '@/app/components/ConfettiRain';
import AphasieChallengeCard from '@/app/components/AphasieChallengeCard';
import type { AphasieChallenge } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

interface AphasieChallengesListProps {
  onMasteredChange?: () => void;
  limit?: number;
  showViewAll?: boolean;
}

export default function AphasieChallengesList({ onMasteredChange, limit, showViewAll = false }: AphasieChallengesListProps) {
  const [challenges, setChallenges] = useState<AphasieChallenge[]>([]);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { currentUser } = useUser();

  const fetchChallenges = () => {
    if (!currentUser) return;
    
    fetch(`/api/aphasie-challenges?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChallenges(data);
        } else {
          console.error('API error:', data);
          setChallenges([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setChallenges([]);
      });
  };

  useEffect(() => {
    fetchChallenges();
  }, [currentUser]);

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

      fetchChallenges();
      if (onMasteredChange) {
        onMasteredChange();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const masteredChallenges = challenges.filter(c => c.mastered);
  const activeChallenges = challenges.filter(c => !c.mastered);
  const displayedActiveChallenges = limit ? activeChallenges.slice(0, limit) : activeChallenges;
  const displayedMasteredChallenges = limit ? masteredChallenges.slice(0, limit) : masteredChallenges;
  const hasMoreActive = limit && activeChallenges.length > limit;
  const hasMoreMastered = limit && masteredChallenges.length > limit;
  const hasMoreTotal = limit && challenges.length > limit;

  return (
    <>
      <ConfettiRain 
        show={showConfetti} 
        fromWindow={true}
      />
      <div>
        {displayedActiveChallenges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-4 text-gray-600 uppercase tracking-wider">En cours</h3>
            <ul className="space-y-3">
              {displayedActiveChallenges.map(challenge => (
                <AphasieChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onMasteredToggle={handleMasteredToggle}
                  isUpdating={isUpdating === challenge.id}
                />
              ))}
            </ul>
          </div>
        )}

        {displayedMasteredChallenges.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-600 uppercase tracking-wider">Maîtrisés</h3>
            <ul className="space-y-3">
              {displayedMasteredChallenges.map(challenge => (
                <AphasieChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onMasteredToggle={handleMasteredToggle}
                  isUpdating={isUpdating === challenge.id}
                />
              ))}
            </ul>
          </div>
        )}

        {challenges.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Aucun challenge pour le moment
          </div>
        )}

        {limit && hasMoreTotal && (
          <ViewAllLink 
            href="/aphasie/challenges"
            label="Voir tous les challenges"
            emoji="🎯"
          />
        )}
      </div>
    </>
  );
}

export function useAphasieChallengesCount() {
  const { currentUser } = useUser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    
    fetch(`/api/aphasie-challenges?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCount(data.length);
        }
      })
      .catch(() => setCount(0));
  }, [currentUser]);

  return count;
}

