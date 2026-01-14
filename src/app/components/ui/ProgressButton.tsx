'use client';

import { ActionButton } from './ActionButton';

import type { MouseEventHandler } from 'react';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: 'fixed' | 'inline';
  position?: 'left' | 'right';
  label?: string;
};

/**
 * Bouton "Noter un progrès" réutilisable
 * 
 * Variantes :
 * - `fixed` : Bouton flottant fixe en bas de l'écran
 * - `inline` : Bouton standard pour intégration dans une page
 * 
 * Utilise ActionButton avec le variant "golden" pour le style doré
 */
export function ProgressButton({ 
  onClick, 
  variant = 'inline',
  position = 'right',
  label = 'Ajouter'
}: Props) {
  return (
    <ActionButton
      variant="golden"
      display={variant}
      position={position}
      label={label}
      onClick={onClick}
      aria-label="Noter un progrès"
    />
  );
}

