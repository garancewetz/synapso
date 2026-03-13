'use client';

import { createContext, useContext, useCallback, useRef, useState } from 'react';

type ConfettiContextType = {
  /** Demande à jouer un confetti. Retourne true si autorisé, false si throttled. */
  requestConfetti: (priority?: 'low' | 'high') => boolean;
  /** Indique qu'un confetti haute priorité (célébration globale) est actif */
  isGlobalCelebrationActive: boolean;
  /** Marque le début d'une célébration globale */
  startGlobalCelebration: () => void;
  /** Marque la fin d'une célébration globale */
  endGlobalCelebration: () => void;
};

const ConfettiContext = createContext<ConfettiContextType>({
  requestConfetti: () => true,
  isGlobalCelebrationActive: false,
  startGlobalCelebration: () => {},
  endGlobalCelebration: () => {},
});

const THROTTLE_MS = 800;

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const lastConfettiRef = useRef(0);
  const [isGlobalCelebrationActive, setIsGlobalCelebrationActive] = useState(false);

  const requestConfetti = useCallback((priority: 'low' | 'high' = 'low') => {
    // Les confettis haute priorité (célébration globale) passent toujours
    if (priority === 'high') return true;

    // Les confettis basse priorité (validation individuelle) sont supprimés
    // pendant une célébration globale
    if (isGlobalCelebrationActive) return false;

    // Throttle : pas plus d'un confetti basse priorité toutes les THROTTLE_MS ms
    const now = Date.now();
    if (now - lastConfettiRef.current < THROTTLE_MS) return false;

    lastConfettiRef.current = now;
    return true;
  }, [isGlobalCelebrationActive]);

  const startGlobalCelebration = useCallback(() => {
    setIsGlobalCelebrationActive(true);
  }, []);

  const endGlobalCelebration = useCallback(() => {
    setIsGlobalCelebrationActive(false);
  }, []);

  return (
    <ConfettiContext.Provider value={{ requestConfetti, isGlobalCelebrationActive, startGlobalCelebration, endGlobalCelebration }}>
      {children}
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  return useContext(ConfettiContext);
}
