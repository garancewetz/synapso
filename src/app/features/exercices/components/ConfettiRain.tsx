'use client';

import { useMemo, memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type ConfettiVariant = 'default' | 'golden';

type Props = {
  show?: boolean;
  fromWindow?: boolean;
  emojiCount?: number;
  confettiCount?: number;
  emojis?: string[];
  colors?: string[];
  variant?: ConfettiVariant;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

const VARIANT_PRESETS: Record<ConfettiVariant, { emojis: string[]; colors: string[] }> = {
  default: {
    emojis: ['🎉', '🎊', '⭐', '💪', '🌟', '✨', '🏆', '💫'],
    colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#ef4444', '#06b6d4'],
  },
  golden: {
    emojis: ['🏆', '⭐', '🌟', '✨', '💫', '👑', '🥇', '💛'],
    colors: [
      '#FFD700',
      '#FFC125',
      '#FFDF00',
      '#F5C542',
      '#E6BE8A',
      '#DAA520',
      '#FFE55C',
      '#C5A35D',
      '#F4D03F',
      '#FADA5E',
    ],
  },
};

type PopEmojiProps = {
  delay: number;
  x: number;
  emoji: string;
  fromWindow?: boolean;
  swayAmount: number;
  swayDirection: number;
};

type ConfettiProps = {
  delay: number;
  startX: number;
  color: string;
  size: number;
  fromWindow?: boolean;
  randomRotation: number;
  swayAmount: number;
  swayDirection: number;
};

const ANIMATION_DURATION = 3.2;
const ANIMATION_TIMES = [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1];

const getFallValues = (fromWindow: boolean): (number | string)[] => {
  if (fromWindow) {
    return [0, '15vh', '30vh', '50vh', '70vh', '90vh', '110vh'];
  }
  return [0, 30, 60, 95, 130, 165, 200];
};

function PopEmoji({ delay, x, emoji, fromWindow = false, swayAmount, swayDirection }: PopEmojiProps) {
  return (
    <motion.div
      className={fromWindow ? "fixed pointer-events-none text-3xl z-50" : "absolute pointer-events-none text-3xl"}
      style={{ 
        left: fromWindow ? `${x}vw` : `${x}%`, 
        top: fromWindow ? '-5vh' : '-10%',
        willChange: 'transform, opacity',
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
        willChange: 'transform, opacity',
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

const ConfettiRain = memo(function ConfettiRain({
  show = false,
  fromWindow = false,
  emojiCount = 5,
  confettiCount = 20,
  emojis,
  colors,
  variant = 'default',
}: Props) {
  const isMobile = useIsMobile();
  const actualEmojiCount = isMobile ? Math.min(emojiCount, 6) : emojiCount;
  const actualConfettiCount = isMobile ? Math.min(confettiCount, 30) : confettiCount;
  
  const preset = VARIANT_PRESETS[variant];
  const finalEmojis = emojis ?? preset.emojis;
  const finalColors = colors ?? preset.colors;
  
  const popEmojis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: actualEmojiCount }, (_, i) => {
      const swayAmount = 20 + Math.random() * 30;
      const swayDirection = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `emoji-${i}`,
        x: fromWindow ? 5 + Math.random() * 90 : 10 + Math.random() * 80,
        delay: 0.1 + i * 0.15 + Math.random() * 0.2,
        emoji: finalEmojis[Math.floor(Math.random() * finalEmojis.length)],
        swayAmount,
        swayDirection,
      };
    });
  }, [show, actualEmojiCount, fromWindow]);

  const confettis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: actualConfettiCount }, (_, i) => {
      const randomRotation = Math.random() * 720;
      const swayAmount = 15 + Math.random() * 25;
      const swayDirection = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `confetti-${i}`,
        startX: fromWindow ? 2 + Math.random() * 96 : 5 + Math.random() * 90,
        delay: (i * 0.04) + Math.random() * 0.3,
        color: finalColors[Math.floor(Math.random() * finalColors.length)],
        size: fromWindow ? 5 + Math.random() * 5 : 4 + Math.random() * 4,
        randomRotation,
        swayAmount,
        swayDirection,
      };
    });
  }, [show, actualConfettiCount, fromWindow]);

  if (!show) return null;

  return (
    <>
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
});

export { ConfettiRain };
