import { useState, useEffect, useRef } from 'react';

const DAILY_GOAL = 5;
const CELEBRATION_DURATION_MS = 4800;

type UseCelebrationReturn = {
  showCelebration: boolean;
  animationKey: number;
};

/**
 * Hook pour gérer l'animation de célébration quand l'objectif quotidien est atteint
 * Déclenche les confettis uniquement quand on passe de moins de 5 à exactement 5
 */
export function useCelebration(completedToday: number | null): UseCelebrationReturn {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevCompletedRef = useRef(completedToday);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup uniquement au unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;

    // Ignorer le chargement initial
    if (completedToday === null) return;

    // Mettre à jour la ref avant toute logique
    prevCompletedRef.current = completedToday;

    // Déclencher quand on passe de moins de 5 à exactement 5
    const wasBelowGoal = prevCompleted !== null && prevCompleted < DAILY_GOAL;
    const isExactlyGoal = completedToday === DAILY_GOAL;

    if (wasBelowGoal && isExactlyGoal) {
      // Annuler le timer précédent si re-trigger pendant l'animation
      if (timerRef.current) clearTimeout(timerRef.current);

      setAnimationKey(prev => prev + 1);
      setShowCelebration(true);

      timerRef.current = setTimeout(() => {
        setShowCelebration(false);
        timerRef.current = null;
      }, CELEBRATION_DURATION_MS);
    }
  }, [completedToday]);

  return { showCelebration, animationKey };
}

