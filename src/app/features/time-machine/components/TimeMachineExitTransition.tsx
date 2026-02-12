'use client';

import { motion } from 'framer-motion';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';

/**
 * Animation de sortie du mode sablier
 * - Fond blanc avec blur
 * - Sablier qui tourne vers la droite (sens horaire)
 * - Message "Retour à aujourd'hui"
 */
export function TimeMachineExitTransition() {
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
      {/* Fond blanc avec blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.3,
          ease: "easeOut",
        }}
        className="absolute inset-0 backdrop-blur-md bg-white"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Fond blanc presque opaque avec blur
        }}
      />
      
      {/* Sablier au centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            scale: [1, 0.8, 0],
            opacity: [1, 0.8, 0],
            rotate: [0, 360], // 1 tour vers la droite (sens horaire)
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            scale: {
              duration: 1.2,
              ease: "easeIn",
            },
            opacity: {
              duration: 1.2,
            },
            rotate: {
              duration: 1.2,
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
        
        {/* Message "Retour à aujourd'hui" */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1], y: [20, 0, 0] }}
          transition={{ 
            delay: 0.3,
            duration: 0.6,
            ease: "easeOut",
          }}
          className="mt-8 text-xl md:text-2xl font-bold text-gray-900"
        >
          Retour à aujourd&apos;hui
        </motion.p>
      </div>
    </motion.div>
  );
}
