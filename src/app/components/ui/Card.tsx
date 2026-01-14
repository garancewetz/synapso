import clsx from 'clsx';
import type { ReactNode } from 'react';
import { DEFAULT_CARD_STYLES } from '@/app/constants/card.constants';

type Props = {
  children: ReactNode;
  /** Variante visuelle de la carte */
  variant?: 'default' | 'outlined' | 'subtle';
  /** Taille du padding interne */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Couleur de fond personnalisée (remplace le bg du variant) */
  bgColor?: string;
  /** Classes CSS additionnelles */
  className?: string;
};

const variantStyles = {
  default: `${DEFAULT_CARD_STYLES.bg} ${DEFAULT_CARD_STYLES.border} ${DEFAULT_CARD_STYLES.shadow}`,
  outlined: `${DEFAULT_CARD_STYLES.bg} border-2 border-gray-200`,
  subtle: 'bg-gray-50 border border-gray-100',
};

// Extraire les classes sans bg pour permettre la surcharge
const variantStylesWithoutBg = {
  default: `${DEFAULT_CARD_STYLES.border} ${DEFAULT_CARD_STYLES.shadow}`,
  outlined: 'border-2 border-gray-200',
  subtle: 'border border-gray-100',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * Composant Card réutilisable pour contenus statiques
 * Standardise l'affichage des cartes dans l'application
 * Pour les cartes interactives avec actions, utiliser BaseCard
 */
export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  bgColor,
  className 
}: Props) {
  return (
    <div className={clsx(
      DEFAULT_CARD_STYLES.rounded,
      bgColor 
        ? `${variantStylesWithoutBg[variant]} ${bgColor}`
        : variantStyles[variant],
      paddingStyles[padding],
      className
    )}>
      {children}
    </div>
  );
}

