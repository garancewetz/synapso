'use client';

import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';

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

const EMERALD_COLORS = [
  '#059669',
  '#10B981',
  '#34D399',
  '#6EE7B7',
  '#A7F3D0',
  '#047857',
  '#0D9488',
];

const ANIMATION_DURATION = 1.6;

function ValidateConfetti({
  delay,
  angle,
  distance,
  color,
  size,
  centerX,
  centerY,
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
  const endX = Math.cos(radians) * distance * 1.35;
  const endY = Math.sin(radians) * distance * 0.5;

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${centerX}%`,
        top: `${centerY}%`,
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        borderRadius: '1px',
        willChange: 'transform, opacity',
      }}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0.9, 0.6, 0.3, 0],
        scale: [0, 1.2, 1.1, 1, 0.9, 0.7, 0.5],
        x: [0, `${endX}vw`],
        y: [0, `${endY}vh`],
        rotate: [0, angle + 540],
      }}
      transition={{
        duration: ANIMATION_DURATION,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.06, 0.2, 0.4, 0.58, 0.76, 1],
      }}
    />
  );
}

export const ConfettiValidate = memo(function ConfettiValidate({
  show = false,
  centerX = 50,
  centerY = 50,
  confettiCount = 28,
}: Props) {
  const isMobile = useIsMobile();
  const actualCount = isMobile ? Math.min(confettiCount, 22) : confettiCount;

  const confettis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: actualCount }, (_, i) => {
      const angle = Math.random() * 360;
      const distance = 18 + Math.random() * 5;
      return {
        id: `validate-confetti-${i}`,
        angle,
        distance,
        delay: 0.02 * i + Math.random() * 0.08,
        color: EMERALD_COLORS[Math.floor(Math.random() * EMERALD_COLORS.length)],
        size: 2 + Math.random() * 2.5,
      };
    });
  }, [show, actualCount]);

  if (!show) return null;

  return (
    <>
      {confettis.map((c) => (
        <ValidateConfetti
          key={c.id}
          delay={c.delay}
          angle={c.angle}
          distance={c.distance}
          color={c.color}
          size={c.size}
          centerX={centerX}
          centerY={centerY}
        />
      ))}
    </>
  );
});
