'use client';

import { motion } from 'framer-motion';
import ConfettiRain from '@/app/components/ConfettiRain';

const SPARKLE_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6'];
const CONFETTI_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];
const CELEBRATION_EMOJIS = ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'];

type Props = {
  isGoalReached: boolean;
  showCelebration: boolean;
  animationKey: number;
};

export function WelcomeHeaderCelebration({ isGoalReached, showCelebration, animationKey }: Props) {
  // Mémoriser les paillettes pour éviter qu'elles se régénèrent à chaque render
  const sparkles = isGoalReached
    ? Array.from({ length: 5 }, (_, i) => ({
        id: `sparkle-${i}`,
        left: `${15 + i * 18}%`,
        top: `${20 + (i % 3) * 25}%`,
        width: 8 + i * 2,
        height: 8 + i * 2,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
        duration: 2 + i * 0.3,
        delay: i * 0.4,
      }))
    : [];

  return (
    <>
      {/* Effet de brillance sur la bordure quand objectif atteint */}
      {isGoalReached && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {/* Confettis : déclenchés uniquement quand on atteint exactement 5/5 */}
      <ConfettiRain
        key={animationKey}
        show={showCelebration}
        fromWindow={true}
        emojiCount={7}
        confettiCount={40}
        emojis={CELEBRATION_EMOJIS}
        colors={CONFETTI_COLORS}
      />

      {/* Paillettes continues quand objectif atteint (5/5 ou plus) */}
      {sparkles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute"
              style={{ 
                left: sparkle.left, 
                top: sparkle.top 
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: sparkle.duration,
                repeat: Infinity,
                delay: sparkle.delay,
                ease: "easeInOut",
              }}
            >
              <svg 
                width={sparkle.width} 
                height={sparkle.height} 
                viewBox="0 0 24 24" 
                fill={sparkle.color}
                className="opacity-60"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}

