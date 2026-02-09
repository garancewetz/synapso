'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';

/**
 * Composant d'animation de transition pour l'activation du mode sablier
 * Affiche un fond sable avec un sablier géant qui tourne puis disparaît
 */
export function TimeMachineTransition() {
  // ⚡ PERFORMANCE: Utiliser isTimeMachineMode et selectedDateKey directement (déjà calculés)
  const { isTimeMachineMode, selectedDateKey, isTransitioning } = useSelectedDate();
  const [showTransition, setShowTransition] = useState(false);
  const previousDateKeyRef = useRef<string | null>(null);

  // ⚡ FIX: Utiliser isTransitioning du contexte pour synchroniser l'animation avec le changement de vue
  useEffect(() => {
    if (isTransitioning) {
      // Déclencher l'animation quand la transition commence
      setShowTransition(true);
    } else {
      // Masquer l'animation quand la transition se termine
      setShowTransition(false);
    }
  }, [isTransitioning]);

  // Détecter quand le mode sablier est activé pour mettre à jour la référence
  useEffect(() => {
    const currentDateKey = isTimeMachineMode ? selectedDateKey : null;
    if (currentDateKey !== previousDateKeyRef.current && !isTransitioning) {
      previousDateKeyRef.current = currentDateKey;
    }
  }, [isTimeMachineMode, selectedDateKey, isTransitioning]);

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] pointer-events-none"
        >
          {/* Fond sable avec gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50"
          />
          
          {/* Sablier géant au centre avec rotation continue */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ 
                scale: [0.3, 1.2, 1],
                opacity: [0, 1, 1],
                rotate: [0, 720], // 2 tours complets
              }}
              exit={{ 
                scale: [1, 1.3, 0],
                opacity: [1, 0.5, 0],
                rotate: [0, 360],
              }}
              transition={{ 
                scale: {
                  duration: 1.2,
                  ease: [0.34, 1.56, 0.64, 1], // Easing avec rebond
                },
                opacity: {
                  duration: 1.2,
                },
                rotate: {
                  duration: 1.5,
                  ease: "linear",
                },
              }}
              className="text-[120px] md:text-[180px] drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 10px 20px rgba(251, 191, 36, 0.5))',
              }}
            >
              {NAVIGATION_EMOJIS.HOURGLASS}
            </motion.div>
          </div>
          
          {/* Particules de sable animées qui partent du centre */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i / 30) * 360;
              const distance = 30 + Math.random() * 20; // Distance en pourcentage
              const x = 50 + Math.cos((angle * Math.PI) / 180) * distance;
              const y = 50 + Math.sin((angle * Math.PI) / 180) * distance;
              
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    x: '50%',
                    y: '50%',
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{ 
                    x: `${x}%`,
                    y: `${y}%`,
                    opacity: [0, 0.8, 0.4, 0],
                    scale: [0, 1.5, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.03,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 bg-amber-400 rounded-full blur-sm"
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
