'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';

/**
 * Composant d'animation de transition pour l'activation et la désactivation du mode sablier
 * - Entrée : Affiche un fond bleu nuit cosmique avec un sablier doré géant qui tourne puis disparaît
 * - Sortie : Affiche un sablier qui disparaît avec un message "Retour à aujourd'hui"
 */
export function TimeMachineTransition() {
  // ⚡ PERFORMANCE: Utiliser isTimeMachineMode et selectedDateKey directement (déjà calculés)
  const { isTimeMachineMode, selectedDateKey, isTransitioning } = useSelectedDate();
  const [showTransition, setShowTransition] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const previousDateKeyRef = useRef<string | null>(null);

  // ⚡ FIX: Détecter si on entre ou sort du mode sablier
  useEffect(() => {
    const currentDateKey = isTimeMachineMode ? selectedDateKey : null;
    const wasInTimeMachine = previousDateKeyRef.current !== null;
    const isEntering = !wasInTimeMachine && currentDateKey;
    const isExitingMode = wasInTimeMachine && !currentDateKey;
    
    if (isTransitioning) {
      // Déclencher l'animation quand la transition commence
      setShowTransition(true);
      setIsExiting(isExitingMode);
      
      // Mettre à jour la référence après la transition
      if (isEntering) {
        previousDateKeyRef.current = currentDateKey;
      } else if (isExitingMode) {
        previousDateKeyRef.current = null;
      }
    } else {
      // Masquer l'animation quand la transition se termine
      setShowTransition(false);
      setIsExiting(false);
    }
  }, [isTransitioning, isTimeMachineMode, selectedDateKey]);

  return (
    <AnimatePresence mode="wait">
      {showTransition && (
        <motion.div
          key={isExiting ? 'exit' : 'enter'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] pointer-events-none"
          style={{
            // ⚡ MOBILE: S'assurer que l'overlay est au-dessus de tout (z-index très élevé)
            zIndex: 9999,
          }}
        >
          {/* Fond bleu nuit cosmique avec gradient (entrée) ou fond blanc (sortie) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={clsx(
              'absolute inset-0',
              // ⚡ MOBILE: Fond complètement opaque pour éviter de voir le contenu derrière
              isExiting 
                ? 'bg-white' // Fond blanc pur pour la sortie
                : '' // Gradient géré via style pour contrôle total de l'opacité
            )}
            style={!isExiting ? {
              // ⚡ MOBILE: Fond indigo cosmique complètement opaque avec gradient et pattern d'étoiles
              // Le gradient de base est opaque, le pattern d'étoiles est en overlay
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0), linear-gradient(to bottom right, rgb(30, 27, 75), rgb(30, 27, 75), rgb(15, 23, 42))',
              backgroundSize: '25px 25px, 100% 100%',
              backgroundColor: 'rgb(30, 27, 75)', // Fond de base indigo-950 complètement opaque
            } : {
              // ⚡ MOBILE: Fond blanc complètement opaque pour la sortie
              backgroundColor: 'rgb(255, 255, 255)',
            }}
          />
          
          {/* Sablier géant au centre avec animation différente selon entrée/sortie */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={isExiting ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.3, opacity: 0, rotate: 0 }}
              animate={isExiting ? {
                scale: [1, 1.2, 0],
                opacity: [1, 0.8, 0],
                rotate: [0, -360], // Rotation inverse pour la sortie
              } : {
                scale: [0.3, 1.2, 1],
                opacity: [0, 1, 1],
                rotate: [0, 720], // 2 tours complets pour l'entrée
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                scale: {
                  duration: isExiting ? 1.2 : 1.2,
                  ease: isExiting ? [0.6, -0.05, 0.01, 0.99] : [0.34, 1.56, 0.64, 1], // Easing différent
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
                filter: 'drop-shadow(0 10px 20px rgba(251, 191, 36, 0.6))',
              }}
            >
              {NAVIGATION_EMOJIS.HOURGLASS}
            </motion.div>
            
            {/* Message "Retour à aujourd'hui" pour la sortie */}
            {isExiting && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-8 text-xl md:text-2xl font-bold text-gray-900"
              >
                Retour à aujourd&apos;hui
              </motion.p>
            )}
          </div>
          
          {/* Particules d'étoiles animées */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: isExiting ? 20 : 30 }).map((_, i) => {
              const angle = (i / (isExiting ? 20 : 30)) * 360;
              const distance = isExiting ? 40 + Math.random() * 30 : 30 + Math.random() * 20;
              const x = 50 + Math.cos((angle * Math.PI) / 180) * distance;
              const y = 50 + Math.sin((angle * Math.PI) / 180) * distance;
              
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    x: '50%',
                    y: '50%',
                    opacity: isExiting ? 0.6 : 0,
                    scale: isExiting ? 1 : 0,
                  }}
                  animate={{ 
                    x: `${x}%`,
                    y: `${y}%`,
                    opacity: isExiting 
                      ? [0.6, 0.4, 0] 
                      : [0, 0.8, 0.4, 0],
                    scale: isExiting 
                      ? [1, 1.2, 0]
                      : [0, 1.5, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: isExiting ? 1.5 : 2,
                    delay: i * (isExiting ? 0.04 : 0.03),
                    ease: "easeOut",
                  }}
                  className={clsx(
                    'absolute w-2 h-2 rounded-full blur-sm',
                    isExiting ? 'bg-gray-300' : 'bg-amber-400'
                  )}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
