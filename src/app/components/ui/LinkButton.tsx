import { TouchLink } from '@/app/components/TouchLink';
import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  href: string;
  children: ReactNode;
  variant?: 'secondary' | 'action' | 'danger' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'full';
  className?: string;
  'aria-label'?: string;
};

/**
 * Composant LinkButton - Lien stylé comme un bouton (mobile-first)
 * 
 * Utilisé pour la navigation (changement de page) avec l'apparence d'un bouton.
 * Sémantiquement correct : c'est un <a>, pas un <button> dans un <a>.
 * Optimisé pour le tactile via TouchLink (touch-action: manipulation).
 * 
 * Variants :
 * - `secondary` : Bouton gris (par défaut)
 * - `action` : Bouton bleu
 * - `danger` : Bouton rouge
 * - `simple` : Bouton gris foncé
 */
export function LinkButton({
  href,
  children,
  variant = 'secondary',
  size = 'md',
  rounded = 'lg',
  className = '',
  'aria-label': ariaLabel,
}: Props) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    secondary: 'bg-gray-50 hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
    action: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400',
    simple: 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-400',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const roundedStyles = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <TouchLink
      href={href}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        roundedStyles[rounded],
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </TouchLink>
  );
}

