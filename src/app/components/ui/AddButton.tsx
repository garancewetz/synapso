'use client';

import { ActionButton } from './ActionButton';
import { useHandPreference } from '@/app/hooks/useHandPreference';

type Props = {
  href?: string;
  label?: string;
  className?: string;
  position?: 'left' | 'right' | 'auto';
  queryParams?: Record<string, string>;
  addFromParam?: boolean;
  /** 'fixed' = bouton flottant (FAB), 'inline' = intégré dans la page */
  layout?: 'inline' | 'fixed';
  onClick?: () => void;
};

/**
 * Bouton rond avec plus pour ajouter des éléments
 * S'adapte automatiquement à la préférence de main de l'utilisateur
 * 
 * Utilise ActionButton avec variant="simple"
 * 
 * @param layout - 'inline' pour intégration dans une page, 'fixed' pour bouton flottant
 * @param position - Position du bouton flottant ('left' | 'right' | 'auto'). Si 'auto', utilise la préférence de main
 */
export function AddButton({
  href,
  label,
  className = '',
  queryParams,
  addFromParam = false,
  layout = 'inline',
  position = 'auto',
  onClick,
}: Props) {
  const { isLeftHanded } = useHandPreference();

  // Déterminer la position automatiquement si 'auto'
  const finalPosition = position === 'auto'
    ? (isLeftHanded ? 'left' : 'right')
    : position;

  return (
    <ActionButton
      variant="simple"
      layout={layout}
      position={finalPosition}
      href={href}
      label={label}
      className={className}
      queryParams={queryParams}
      addFromParam={addFromParam}
      onClick={onClick}
      aria-label={label || 'Ajouter'}
    />
  );
}

