'use client';

import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';

type Props = {
  show?: boolean;
  centerX?: number;
  centerY?: number;
  confettiCount?: number;
};

// ⚡ PERFORMANCE: Détecter si on est sur mobile pour réduire le nombre de particules
const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Couleurs des 4 catégories de l'app (exactes du projet)
const CATEGORY_COLORS = [
  '#F97316', // Orange - Haut du corps
  '#14B8A6', // Teal - Milieu du corps
  '#3B82F6', // Bleu - Bas du corps
  '#8B5CF6', // Violet - Étirement
];

const ANIMATION_DURATION = 3.5;

// Composant Confetti qui explose depuis le centre
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
  // Calculer la position finale en utilisant vw/vh pour atteindre les bords
  // Utiliser une combinaison de vw et vh pour couvrir tout l'écran
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
  const isMobile = useIsMobile();
  const actualConfettiCount = isMobile ? Math.min(confettiCount, 30) : confettiCount;

  // Générer les confettis qui explosent dans toutes les directions
  // Amplitude maximale : les confettis vont jusqu'aux bords de l'écran
  // Depuis le centre (50%, 50%), pour atteindre les bords :
  // - Horizontalement : 50vw (du centre au bord)
  // - Verticalement : 50vh (du centre au bord)
  // - Diagonale : ~70vw (sqrt(50² + 50²))
  // On utilise 50-80 pour être sûr d'atteindre tous les bords
  const explosionConfettis = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: actualConfettiCount }, (_, i) => {
      const angle = Math.random() * 360;
      // Distance de 50 à 80 pour atteindre tous les bords de l'écran
      const distance = 50 + Math.random() * 30;
      return {
        id: `confetti-${i}`,
        angle,
        distance,
        delay: 0.02 * i + Math.random() * 0.1,
        // Utiliser uniquement les 4 couleurs des catégories
        color: CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)],
        size: 5 + Math.random() * 5,
      };
    });
  }, [show, actualConfettiCount]);

  if (!show) return null;

  return (
    <>
      {/* Confettis qui explosent */}
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
