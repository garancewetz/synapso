import clsx from 'clsx';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
};

const variantStyles = {
  default: 'bg-white border border-gray-100 shadow-sm',
  elevated: 'bg-white border border-gray-100 shadow-lg',
  outlined: 'bg-white border-2 border-gray-200',
  subtle: 'bg-gray-50 border border-gray-100',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * Composant Card réutilisable
 * Standardise l'affichage des cartes dans l'application
 */
export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className 
}: Props) {
  return (
    <div className={clsx(
      'rounded-2xl',
      variantStyles[variant],
      paddingStyles[padding],
      className
    )}>
      {children}
    </div>
  );
}

