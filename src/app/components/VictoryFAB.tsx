'use client';

import { useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import VictoryBottomSheet from './VictoryBottomSheet';
import VictoryButton from './VictoryButton';

interface VictoryFABProps {
  onSuccess?: () => void;
}

/**
 * Bouton flottant "Noter une victoire" - présent sur toutes les pages principales
 * 
 * Se positionne automatiquement selon la main dominante de l'utilisateur :
 * - Main droite → bouton à droite (zone de confort du pouce)
 * - Main gauche → bouton à gauche
 * 
 * Ouvre le VictoryBottomSheet pour noter une petite victoire.
 */
export default function VictoryFAB({ onSuccess }: VictoryFABProps) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const { currentUser } = useUser();

  // Ne pas afficher si pas d'utilisateur connecté
  if (!currentUser) return null;

  const isLeftHanded = currentUser.dominantHand === 'LEFT';

  const handleSuccess = () => {
    onSuccess?.();
  };

  return (
    <>
      {/* Bouton flottant - position adaptée à la main dominante */}
      <VictoryButton 
        onClick={() => setShowBottomSheet(true)}
        variant="fixed"
        position={isLeftHanded ? 'left' : 'right'}
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

