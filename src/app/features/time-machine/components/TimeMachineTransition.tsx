'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { TimeMachineEnterTransition } from './TimeMachineEnterTransition';
import { TimeMachineExitTransition } from './TimeMachineExitTransition';

/**
 * Composant wrapper qui affiche l'animation d'entrée ou de sortie selon le contexte
 */
export function TimeMachineTransition() {
  const { isTransitioning, transitionType } = useSelectedDate();
  const [showTransition, setShowTransition] = useState(false);

  // ⚡ FIX: Utiliser transitionType directement depuis le contexte
  // C'est plus fiable que de détecter manuellement
  useEffect(() => {
    if (isTransitioning && !showTransition) {
      // Transition qui commence
      setShowTransition(true);
    } else if (!isTransitioning && showTransition) {
      // Transition qui se termine
      setShowTransition(false);
    }
  }, [isTransitioning, showTransition]);

  const isExiting = transitionType === 'exit';

  return (
    <AnimatePresence mode="wait">
      {showTransition && (
        isExiting ? (
          <TimeMachineExitTransition key="exit" />
        ) : (
          <TimeMachineEnterTransition key="enter" />
        )
      )}
    </AnimatePresence>
  );
}
