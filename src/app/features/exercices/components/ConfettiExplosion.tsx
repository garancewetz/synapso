'use client';

import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/app/hooks/useReducedMotion';

type Props = {
  show?: boolean;
  centerX?: number;
  centerY?: number;
  confettiCount?: number;
};

const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

const CATEGORY_COLORS = [
  '#F97316',
  '#14B8A6',
  '#3B82F6',
  '#8B5CF6',
];

const ANIMATION_DURATION = 3.5;

function ExplosionConfetti({ 
  delay, 
  angle, 
  distance, 
  color, 
  size, 
  centerX, 
  centerY 
}: { 
  delay: number; 
  angle: number; 
  distance: number; 
  color: string; 
  size: number; 
  centerX: number; 
  centerY: number;
}) {
  const radians = (angle * Math.PI) / 180;
  const endX = Math.cos(radians) * distance;
  const endY = Math.sin(radians) * distance;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ 
        left: `${centerX}%`, 
        top: `${centerY}%`,
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        borderRadius: '2px',
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 1, 1, 0.8, 0.5, 0],
        scale: [0, 1.3, 1.2, 1.1, 1, 0.95, 0.8, 0.6],
        x: [0, `${endX}vw`],
        y: [0, `${endY}vh`],
        rotate: [0, angle + 720],
      }}
      transition={{
        duration: ANIMATION_DURATION,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 1],
      }}
    />
  );
}

export const ConfettiExplosion = memo(function ConfettiExplosion({
  show = false,
  centerX = 50,
  centerY = 50,
  confettiCount = 40,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const actualConfettiCount = isMobile ? Math.min(confettiCount, 18) : confettiCount;

  const explosionConfettis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: actualConfettiCount }, (_, i) => {
      const angle = Math.random() * 360;
      const distance = 50 + Math.random() * 30;
      return {
        id: `confetti-${i}`,
        angle,
        distance,
        delay: 0.02 * i + Math.random() * 0.1,
        color: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)],
        size: 5 + Math.random() * 5,
      };
    });
  }, [show, actualConfettiCount]);

  if (!show || prefersReducedMotion) return null;

  return (
    <>
      {explosionConfettis.map((confetti) => (
        <ExplosionConfetti
          key={confetti.id}
          delay={confetti.delay}
          angle={confetti.angle}
          distance={confetti.distance}
          color={confetti.color}
          size={confetti.size}
          centerX={centerX}
          centerY={centerY}
        />
      ))}
    </>
  );
});
