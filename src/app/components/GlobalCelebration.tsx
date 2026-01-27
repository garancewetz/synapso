'use client';

import { useTodayCompletedCount } from '@/app/hooks/useTodayCompletedCount';
import { useCelebration } from '@/app/hooks/useCelebration';
import { ConfettiRain } from '@/app/components/ConfettiRain';

const CELEBRATION_EMOJIS = ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'];
const CONFETTI_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];

/**
 * Composant global de célébration qui affiche les confettis
 * quand l'utilisateur atteint 5 exercices complétés aujourd'hui
 * 
 * Présent sur toutes les pages via le layout principal
 */
export function GlobalCelebration() {
  const completedToday = useTodayCompletedCount();
  const { showCelebration, animationKey } = useCelebration(completedToday);

  return (
    <ConfettiRain
      key={animationKey}
      show={showCelebration}
      fromWindow={true}
      emojiCount={7}
      confettiCount={40}
      emojis={CELEBRATION_EMOJIS}
      colors={CONFETTI_COLORS}
    />
  );
}

