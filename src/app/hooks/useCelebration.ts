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
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    
    // Ignorer si on charge ou si une animation est en cours
    if (completedToday === null || isAnimatingRef.current) {
      if (completedToday !== null) {
        prevCompletedRef.current = completedToday;
      }
      return;
    }
    
    // Ignorer si pas de changement ou régression
    if (prevCompleted === completedToday || (prevCompleted !== null && completedToday < prevCompleted)) {
      prevCompletedRef.current = completedToday;
      return;
    }
    
    // Déclencher uniquement quand on passe de moins de 5 à exactement 5
    const wasBelowGoal = prevCompleted !== null && prevCompleted < DAILY_GOAL;
    const isExactlyGoal = completedToday === DAILY_GOAL;
    
    if (wasBelowGoal && isExactlyGoal) {
      isAnimatingRef.current = true;
      prevCompletedRef.current = completedToday;
      
      setAnimationKey(prev => prev + 1);
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
        isAnimatingRef.current = false;
      }, CELEBRATION_DURATION_MS);
      
      return () => clearTimeout(timer);
    }
    
    prevCompletedRef.current = completedToday;
  }, [completedToday]);

  return { showCelebration, animationKey };
}

