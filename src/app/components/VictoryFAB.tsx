'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import VictoryBottomSheet from './VictoryBottomSheet';
import VictoryButton from './VictoryButton';
import ConfettiRain from './ConfettiRain';
import { useHandPreference } from '@/app/hooks/useHandPreference';

interface VictoryFABProps {
  onSuccess?: () => void;
}

/**
 * Bouton flottant "Noter une victoire" - présent sur toutes les pages principales
 * 
 * Se positionne automatiquement selon la préférence de main de l'utilisateur :
 * - Main droite → bouton à droite (zone de confort du pouce)
 * - Main gauche → bouton à gauche
 * 
 * Fonctionne sur mobile ET desktop.
 * Ouvre le VictoryBottomSheet pour noter une petite victoire.
 * Déclenche une pluie de confettis dorés lors d'une victoire ajoutée.
 */
export default function VictoryFAB({ onSuccess }: VictoryFABProps) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { currentUser } = useUser();

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Ne pas afficher si pas d'utilisateur connecté
  if (!currentUser) return null;

  const { isLeftHanded } = useHandPreference();
  const position = isLeftHanded ? 'left' : 'right';

  const handleSuccess = () => {
    // Déclencher la pluie de confettis dorés
    setShowConfetti(true);
    onSuccess?.();
  };

  return (
    <>
      {/* Pluie de confettis dorés pour célébrer la victoire */}
      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

      {/* Bouton flottant - position adaptée à la préférence de main */}
      <VictoryButton 
        onClick={() => setShowBottomSheet(true)}
        variant="fixed"
        position={position}
      />

      {/* Bottom Sheet */}
      <VictoryBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onSuccess={handleSuccess}
        userId={currentUser.id}
      />
    </>
  );
}

