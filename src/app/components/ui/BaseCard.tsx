'use client';

import clsx from 'clsx';
import { createContext, useContext, type ReactNode } from 'react';
import { GOLDEN_CARD_STYLES, GOLDEN_ACCENT_STYLES, GOLDEN_FOOTER_STYLES, DEFAULT_CARD_STYLES, DEFAULT_ACCENT_STYLES, DEFAULT_FOOTER_STYLES } from '@/app/constants/card.constants';

// ============================================================================
// CONTEXT - Propage isGolden aux sous-composants automatiquement
// ============================================================================

type BaseCardContextType = {
  isGolden: boolean;
};

const BaseCardContext = createContext<BaseCardContextType>({ isGolden: false });

function useBaseCardContext() {
  return useContext(BaseCardContext);
}

// ============================================================================
// TYPES
// ============================================================================

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
  /** Active le style doré pour les cartes de célébration/victoire */
  isGolden?: boolean;
  fullHeight?: boolean;
};

type AccentProps = {
  /** Couleur de la bande (classe Tailwind, ex: "bg-teal-500") */
  color?: string;
  /** Largeur personnalisée (classe Tailwind, ex: "w-2") */
  width?: string;
};

type ContentProps = {
  children: ReactNode;
  className?: string;
};

type FooterProps = {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

/**
 * Composant de base pour les cartes interactives (exercices, challenges, etc.)
 * Utilise le pattern compound components pour une composition flexible.
 * 
 * La prop `isGolden` est automatiquement propagée aux sous-composants via Context.
 * 
 * @example
 * // Carte normale
 * <BaseCard>
 *   <BaseCard.Accent color="bg-teal-500" />
 *   <BaseCard.Content>Contenu</BaseCard.Content>
 *   <BaseCard.Footer>Actions</BaseCard.Footer>
 * </BaseCard>
 * 
 * @example
 * // Carte dorée (célébration) - isGolden propagé automatiquement
 * <BaseCard isGolden>
 *   <BaseCard.Accent />
 *   <BaseCard.Content>Victoire !</BaseCard.Content>
 *   <BaseCard.Footer>🎉</BaseCard.Footer>
 * </BaseCard>
 */
function BaseCardRoot({
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
  fullHeight = false,
}: BaseCardProps) {
  const baseClasses = clsx(
    isGolden ? GOLDEN_CARD_STYLES.card : DEFAULT_CARD_STYLES.card,
    onClick && isGolden && 'cursor-pointer transition-all duration-200 ease-out md:hover:ring-2 md:hover:ring-amber-300/50 md:hover:ring-offset-2 active:scale-[0.99]',
    onClick && !isGolden && 'cursor-pointer transition-all duration-200 ease-out md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2 active:scale-[0.99]',
    className
  );

  return (
    <BaseCardContext.Provider value={{ isGolden }}>
      <Component
        className={baseClasses}
        onClick={onClick}
        onKeyDown={onKeyDown}
        role={role}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
      >
        <div className={clsx('flex', fullHeight && 'h-full')}>
          {children}
        </div>
      </Component>
    </BaseCardContext.Provider>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

/**
 * Bande latérale colorée de la carte
 * Utilise automatiquement le style doré si le parent a isGolden
 */
function Accent({ color, width }: AccentProps) {
  const { isGolden } = useBaseCardContext();
  const accentColor = isGolden ? GOLDEN_ACCENT_STYLES.gradient : color || '';
  const accentWidth = isGolden ? GOLDEN_ACCENT_STYLES.width : (width || DEFAULT_ACCENT_STYLES.width);
  
  return (
    <div className={clsx('shrink-0', accentWidth, accentColor)} />
  );
}

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

/**
 * Footer de la carte avec boutons d'action
 * Utilise automatiquement le style doré si le parent a isGolden
 */
function Footer({ children, className, onClick }: FooterProps) {
  const { isGolden } = useBaseCardContext();
  const defaultClasses = isGolden ? GOLDEN_FOOTER_STYLES.classes : DEFAULT_FOOTER_STYLES.classes;
  return (
    <div className={clsx(defaultClasses, className)} onClick={onClick}>
      {children}
    </div>
  );
}

// ============================================================================
// EXPORT AVEC TYPAGE COMPLET
// ============================================================================

type BaseCardComponent = typeof BaseCardRoot & {
  Accent: typeof Accent;
  Content: typeof Content;
  Footer: typeof Footer;
};

// Attacher les sous-composants avec typage
export const BaseCard = BaseCardRoot as BaseCardComponent;
BaseCard.Accent = Accent;
BaseCard.Content = Content;
BaseCard.Footer = Footer;
