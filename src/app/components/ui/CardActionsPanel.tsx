import type { ReactNode } from 'react';
import clsx from 'clsx';

type CardActionsPanelColor = 'gray' | 'neutral' | 'amber';

type Props = {
  /** Contrôle l'ouverture/fermeture du panneau */
  isOpen: boolean;
  children: ReactNode;
  /** Palette de couleurs (gray = exercices, neutral = journal, amber = progrès) */
  color?: CardActionsPanelColor;
  /** Nombre de colonnes de la grille (défaut: 2) */
  columns?: 1 | 2 | 3;
  /** Classes CSS additionnelles sur le wrapper */
  className?: string;
};

const bgStyles: Record<CardActionsPanelColor, string> = {
  gray: 'bg-gray-50/70',
  neutral: 'bg-neutral-50/50',
  amber: 'bg-amber-50/70',
};

const borderStyles: Record<CardActionsPanelColor, string> = {
  gray: 'border-t border-gray-200',
  neutral: 'border-t border-neutral-100',
  amber: 'border-t border-amber-200',
};

const colStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

/**
 * Panneau d'actions collapsible pour les cartes.
 * S'anime en hauteur via CSS grid (0fr → 1fr).
 * Contient des CardActionButton en grille.
 */
export function CardActionsPanel({
  isOpen,
  children,
  color = 'gray',
  columns = 2,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'grid overflow-hidden transition-all duration-200 ease-out',
        bgStyles[color],
        className,
      )}
      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
    >
      <div className="min-h-0">
        <div className={clsx('grid', colStyles[columns], borderStyles[color])}>
          {children}
        </div>
      </div>
    </div>
  );
}
