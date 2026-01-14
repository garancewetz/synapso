'use client';

import { ActionButton } from './ActionButton';

type Props = {
  href: string;
  label?: string;
  className?: string;
  position?: 'left' | 'right' | 'auto';
  queryParams?: Record<string, string>;
  addFromParam?: boolean;
};

/**
 * Bouton rond avec plus pour ajouter des éléments
 * S'adapte automatiquement à la préférence de main de l'utilisateur
 * 
 * Utilise ActionButton avec variant="simple"
 */
export function AddButton({ 
  href, 
  label, 
  className = '',
  queryParams,
  addFromParam = false
}: Props) {
  return (
    <ActionButton
      variant="simple"
      display="inline"
      href={href}
      label={label}
      className={className}
      queryParams={queryParams}
      addFromParam={addFromParam}
      aria-label={label || 'Ajouter'}
    />
  );
}

