'use client';

import clsx from 'clsx';

type ArrowDirection = 'up' | 'down' | 'left' | 'right';
type Color = 'amber' | 'emerald';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  /** Texte du badge */
  label: string;
  /** Couleur du badge */
  color: Color;
  /** Direction de la flèche */
  arrowDirection: ArrowDirection;
  /** Position absolue (classes Tailwind) */
  position: string;
  /** Taille du badge */
  size?: Size;
  /** Classes additionnelles */
  className?: string;
};

const arrowPaths: Record<ArrowDirection, string> = {
  up: 'M19 9l-7 7-7-7',
  down: 'M5 15l7-7 7 7',
  left: 'M15 19l-7-7 7-7',
  right: 'M9 5l7 7-7 7',
};

const sizeClasses = {
  sm: {
    text: 'text-xs sm:text-sm',
    svg: 'w-4 h-4 sm:w-5 sm:h-5',
    padding: 'px-2.5 sm:px-3 py-1 sm:py-1.5',
  },
  md: {
    text: 'text-xs sm:text-sm md:text-base',
    svg: 'w-5 h-5 sm:w-6 sm:h-6',
    padding: 'px-2.5 sm:px-3 py-1 sm:py-1.5',
  },
  lg: {
    text: 'text-sm md:text-base',
    svg: 'w-6 h-6 sm:w-8 sm:h-8',
    padding: 'px-3 sm:px-4 py-1.5 sm:py-2',
  },
};

/**
 * Badge d'annotation avec flèche directionnelle
 * Utilisé dans les slides d'onboarding pour guider l'attention
 */
const colorClasses = {
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
  },
} as const;

export function AnnotationBadge({
  label,
  color,
  arrowDirection,
  position,
  size = 'sm',
  className,
}: Props) {
  const colorConfig = colorClasses[color];
  const sizeConfig = sizeClasses[size];

  return (
    <div className={clsx('absolute z-20', position, className)}>
      <div
        className={clsx(
          colorConfig.bg,
          'text-white rounded-lg shadow-lg font-semibold whitespace-nowrap',
          sizeConfig.text,
          sizeConfig.padding
        )}
      >
        {label}
      </div>
      <svg
        className={clsx(colorConfig.text, 'mx-auto', sizeConfig.svg)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={arrowPaths[arrowDirection]} />
      </svg>
    </div>
  );
}

