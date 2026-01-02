'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { GOLDEN_CARD_STYLES, GOLDEN_ACCENT_STYLES, GOLDEN_FOOTER_STYLES, DEFAULT_CARD_STYLES, DEFAULT_ACCENT_STYLES, DEFAULT_FOOTER_STYLES } from '@/app/constants/card.constants';

type BaseCardProps = {
  children: ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  as?: 'div' | 'li';
  isGolden?: boolean;
};

/**
 * Composant de base pour les cartes (exercices, challenges, etc.)
 * Utilise le pattern compound components pour une composition flexible
 * 
 * @example
 * <BaseCard>
 *   <BaseCard.Accent color="bg-teal-500" />
 *   <BaseCard.Content>
 *     Contenu de la carte
 *   </BaseCard.Content>
 *   <BaseCard.Footer>
 *     Boutons d'action
 *   </BaseCard.Footer>
 * </BaseCard>
 */
export function BaseCard({
  children,
  onClick,
  onKeyDown,
  className = '',
  role,
  tabIndex,
  ariaLabel,
  ariaExpanded,
  as: Component = 'div',
  isGolden = false,
}: BaseCardProps) {
  const baseClasses = clsx(
    isGolden ? GOLDEN_CARD_STYLES.card : DEFAULT_CARD_STYLES.card,
    onClick && 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300',
    className
  );

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
    >
      <div className="flex">
        {children}
      </div>
    </Component>
  );
}

type AccentProps = {
  color?: string;
  width?: string;
  isGolden?: boolean;
};

/**
 * Bande latérale colorée de la carte
 */
function Accent({ color, width, isGolden = false }: AccentProps) {
  const accentColor = isGolden ? GOLDEN_ACCENT_STYLES.gradient : color || '';
  const accentWidth = isGolden ? GOLDEN_ACCENT_STYLES.width : (width || DEFAULT_ACCENT_STYLES.width);
  
  return (
    <div className={clsx('flex-shrink-0', accentWidth, accentColor)} />
  );
}

type ContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Contenu principal de la carte
 */
function Content({ children, className }: ContentProps) {
  return (
    <div className={clsx('flex-1', className)}>
      {children}
    </div>
  );
}

type FooterProps = {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  isGolden?: boolean;
};

/**
 * Footer de la carte avec boutons d'action
 */
function Footer({ children, className, onClick, isGolden = false }: FooterProps) {
  const defaultClasses = isGolden ? GOLDEN_FOOTER_STYLES.classes : DEFAULT_FOOTER_STYLES.classes;
  return (
    <div className={clsx(defaultClasses, className)} onClick={onClick}>
      {children}
    </div>
  );
}

// Attacher les sous-composants
BaseCard.Accent = Accent;
BaseCard.Content = Content;
BaseCard.Footer = Footer;
