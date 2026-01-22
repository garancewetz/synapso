'use client';

import { ActionButton } from './ActionButton';
import { useHandPreference } from '@/app/hooks/useHandPreference';

type Props = {
  href: string;
  label?: string;
  className?: string;
  position?: 'left' | 'right' | 'auto';
  queryParams?: Record<string, string>;
  addFromParam?: boolean;
  display?: 'inline' | 'fixed';
};

/**
 * Bouton rond avec plus pour ajouter des éléments
 * S'adapte automatiquement à la préférence de main de l'utilisateur
 * 
 * Utilise ActionButton avec variant="simple"
 * 
 * @param display - 'inline' pour intégration dans une page, 'fixed' pour bouton flottant
 * @param position - Position du bouton flottant ('left' | 'right' | 'auto'). Si 'auto', utilise la préférence de main
 */
export function AddButton({ 
  href, 
  label, 
  className = '',
  queryParams,
  addFromParam = false,
  display = 'inline',
  position = 'auto'
}: Props) {
  const { isLeftHanded } = useHandPreference();
  
  // Déterminer la position automatiquement si 'auto'
  const finalPosition = position === 'auto' 
    ? (isLeftHanded ? 'left' : 'right')
    : position;

  return (
    <ActionButton
      variant="simple"
      display={display}
      position={finalPosition}
      href={href}
      label={label}
      className={className}
      queryParams={queryParams}
      addFromParam={addFromParam}
      aria-label={label || 'Ajouter'}
    />
  );
}

