'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConfettiRainProps {
  show?: boolean;
  fromWindow?: boolean;
  emojiCount?: number;
  confettiCount?: number;
  emojis?: string[];
  colors?: string[];
}

interface PopEmojiProps {
  delay: number;
  x: number;
  emoji: string;
  fromWindow?: boolean;
  swayAmount: number;
  swayDirection: number;
}

interface ConfettiProps {
  delay: number;
  startX: number;
  color: string;
  size: number;
  fromWindow?: boolean;
  randomRotation: number;
  swayAmount: number;
  swayDirection: number;
}

const ANIMATION_DURATION = 3.2;
const ANIMATION_TIMES = [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1];

// Helper pour calculer les valeurs Y de chute selon le contexte
const getFallValues = (fromWindow: boolean): (number | string)[] => {
  if (fromWindow) {
    return [0, '15vh', '30vh', '50vh', '70vh', '90vh', '110vh'];
  }
  return [0, 30, 60, 95, 130, 165, 200];
};

// Composant Emoji qui tombe avec les confettis
function PopEmoji({ delay, x, emoji, fromWindow = false, swayAmount, swayDirection }: PopEmojiProps) {
  return (
    <motion.div
      className={fromWindow ? "fixed pointer-events-none text-3xl z-50" : "absolute pointer-events-none text-3xl"}
      style={{ 
        left: fromWindow ? `${x}vw` : `${x}%`, 
        top: fromWindow ? '-5vh' : '-10%' 
      }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 1, 0.9, 0.7, 0],
        scale: [0.5, 1.2, 1.1, 1, 0.95, 0.9, 0.8],
        y: getFallValues(fromWindow),
        x: [
          0, 
          swayDirection * swayAmount * 0.5, 
          swayDirection * swayAmount,
          swayDirection * swayAmount * 0.3,
          swayDirection * -swayAmount * 0.4,
          swayDirection * -swayAmount * 0.6,
          swayDirection * -swayAmount * 0.3,
        ],
        rotate: [0, -10, 8, -6, 10, -5, 0],
      }}
      transition={{
        duration: ANIMATION_DURATION,
        delay,
        ease: "linear",
        times: ANIMATION_TIMES,
      }}
    >
      {emoji}
    </motion.div>
  );
}

// Composant Confetti amélioré - chute fluide
function Confetti({ delay, startX, color, size, fromWindow = false, randomRotation, swayAmount, swayDirection }: ConfettiProps) {
  return (
    <motion.div
      className={fromWindow ? "fixed pointer-events-none z-50" : "absolute pointer-events-none"}
      style={{ 
        left: fromWindow ? `${startX}vw` : `${startX}%`, 
        top: fromWindow ? '-2vh' : '-5%',
        width: size,
        height: size * 1.8,
        backgroundColor: color,
        borderRadius: '1px',
      }}
      initial={{ opacity: 0, y: 0, x: 0, rotate: 0, rotateX: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 1, 0.9, 0.7, 0],
        y: getFallValues(fromWindow),
        x: [
          0, 
          swayDirection * swayAmount * 0.5, 
          swayDirection * swayAmount,
          swayDirection * swayAmount * 0.3,
          swayDirection * -swayAmount * 0.4,
          swayDirection * -swayAmount * 0.6,
          swayDirection * -swayAmount * 0.3,
        ],
        rotate: [0, randomRotation * 0.2, randomRotation * 0.5, randomRotation * 0.7, randomRotation * 0.85, randomRotation],
        rotateX: [0, 45, 90, 135, 180, 225, 270],
      }}
      transition={{
        duration: ANIMATION_DURATION,
        delay,
        ease: "linear",
        times: ANIMATION_TIMES,
      }}
    />
  );
}

const DEFAULT_EMOJIS = ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'];
const DEFAULT_COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'];

export default function ConfettiRain({
  show = false,
  fromWindow = false,
  emojiCount = 5,
  confettiCount = 20,
  emojis = DEFAULT_EMOJIS,
  colors = DEFAULT_COLORS,
}: ConfettiRainProps) {
  // Mémoriser les emojis et confettis pour éviter qu'ils changent pendant l'animation
  // On régénère uniquement quand show passe à true (nouvelle animation)
  const popEmojis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: emojiCount }, (_, i) => {
      const swayAmount = 20 + Math.random() * 30;
      const swayDirection = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `emoji-${i}`,
        x: fromWindow ? 5 + Math.random() * 90 : 10 + Math.random() * 80,
        delay: 0.1 + i * 0.15 + Math.random() * 0.2,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        swayAmount,
        swayDirection,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, emojiCount, fromWindow]);

  // Mémoriser les confettis de la même manière
  const confettis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: confettiCount }, (_, i) => {
      const randomRotation = Math.random() * 720;
      const swayAmount = 15 + Math.random() * 25;
      const swayDirection = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `confetti-${i}`,
        startX: fromWindow ? 2 + Math.random() * 96 : 5 + Math.random() * 90,
        delay: (i * 0.04) + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: fromWindow ? 5 + Math.random() * 5 : 4 + Math.random() * 4,
        randomRotation,
        swayAmount,
        swayDirection,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, confettiCount, fromWindow]);

  if (!show) return null;

  return (
    <>
      {/* Emojis qui tombent */}
      {popEmojis.map((emoji) => (
        <PopEmoji
          key={emoji.id}
          delay={emoji.delay}
          x={emoji.x}
          emoji={emoji.emoji}
          fromWindow={fromWindow}
          swayAmount={emoji.swayAmount}
          swayDirection={emoji.swayDirection}
        />
      ))}
      
      {/* Confettis qui tombent */}
      {confettis.map((confetti) => (
        <Confetti
          key={confetti.id}
          delay={confetti.delay}
          startX={confetti.startX}
          color={confetti.color}
          size={confetti.size}
          fromWindow={fromWindow}
          randomRotation={confetti.randomRotation}
          swayAmount={confetti.swayAmount}
          swayDirection={confetti.swayDirection}
        />
      ))}
    </>
  );
}

