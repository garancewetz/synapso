'use client';

import { motion } from 'framer-motion';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';

/**
 * Animation d'entrée en mode sablier
 * - Fond indigo foncé avec blur
 * - Sablier qui tourne vers la gauche (sens anti-horaire)
 */
export function TimeMachineEnterTransition() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 z-200 pointer-events-none"
      style={{
        zIndex: 9999,
      }}
    >
      {/* Fond indigo foncé avec blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.15,
          ease: "easeOut",
        }}
        className="absolute inset-0 backdrop-blur-md bg-indigo-900/80"
      />
      
      {/* Sablier au centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
          animate={{
            scale: [0.8, 1, 1],
            opacity: [0, 1, 1],
            rotate: [0, -360], // 1 tour vers la gauche (sens anti-horaire)
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            scale: {
              duration: 1.5,
              ease: "easeOut",
            },
            opacity: {
              duration: 1.5,
            },
            rotate: {
              duration: 1.8,
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
      </div>
    </motion.div>
  );
}
