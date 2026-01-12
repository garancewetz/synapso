'use client';

import clsx from 'clsx';

type Color = 'amber' | 'emerald';
type Shape = 'rect' | 'circle';
type Inset = 'none' | 'sm' | 'md';

type Props = {
  /** Couleur de la bordure */
  color: Color;
  /** Forme de la zone */
  shape: Shape;
  /** Inset (décalage de la bordure) */
  inset: Inset;
  /** Classes additionnelles */
  className?: string;
};

const insetClasses: Record<Inset, string> = {
  none: 'inset-0',
  sm: 'inset-0 sm:-inset-2',
  md: 'inset-0 sm:-inset-3',
};

const shapeClasses: Record<Shape, string> = {
  rect: 'rounded-xl',
  circle: 'rounded-full',
};

const colorClasses = {
  amber: 'border-amber-500',
  emerald: 'border-emerald-500',
} as const;

/**
 * Zone de surbrillance pour mettre en évidence un élément
 * Utilisé dans les slides d'onboarding pour guider l'attention
 */
export function HighlightZone({ color, shape, inset, className }: Props) {
  return (
    <div
      className={clsx(
        'absolute border-[3px] pointer-events-none z-10',
        colorClasses[color],
        insetClasses[inset],
        shapeClasses[shape],
        className
      )}
    />
  );
}

