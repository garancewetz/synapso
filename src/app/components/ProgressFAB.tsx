'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { ProgressBottomSheet } from './ProgressBottomSheet';
import { ProgressButton } from './ProgressButton';
import { ConfettiRain } from './ConfettiRain';
import { useHandPreference } from '@/app/hooks/useHandPreference';

type Props = {
  onSuccess?: () => void;
  defaultCategory?: 'ORTHOPHONIE';
};

/**
 * Bouton flottant "Noter un progrès" - présent sur toutes les pages principales
 * 
 * Se positionne automatiquement selon la préférence de main de l'utilisateur :
 * - Main droite → bouton à droite (zone de confort du pouce)
 * - Main gauche → bouton à gauche
 * 
 * Fonctionne sur mobile ET desktop.
 * Ouvre le ProgressBottomSheet pour noter un petit progrès.
 * Déclenche une pluie de confettis dorés lors d'un progrès ajouté.
 */
export function ProgressFAB({ onSuccess, defaultCategory }: Props) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { effectiveUser } = useUser();
  const { isLeftHanded } = useHandPreference();

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Ne pas afficher si pas d'utilisateur connecté
  if (!effectiveUser) return null;

  const position = isLeftHanded ? 'left' : 'right';

  const handleSuccess = () => {
    // Déclencher la pluie de confettis dorés
    setShowConfetti(true);
    onSuccess?.();
  };

  return (
    <>
      {/* Pluie de confettis dorés pour célébrer le progrès */}
      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

      {/* Bouton flottant - position adaptée à la préférence de main */}
      <ProgressButton 
        onClick={() => setShowBottomSheet(true)}
        variant="fixed"
        position={position}
      />

      {/* Bottom Sheet */}
      <ProgressBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onSuccess={handleSuccess}
        userId={effectiveUser.id}
        defaultCategory={defaultCategory}
      />
    </>
  );
}

