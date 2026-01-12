'use client';

import clsx from 'clsx';

type Props = {
  /** Taille de la flèche */
  size?: 'md' | 'lg';
  /** Couleur de la flèche */
  color?: 'amber' | 'emerald';
  /** Classes additionnelles */
  className?: string;
};

const sizeClasses = {
  md: 'w-10 h-10 md:w-12 md:h-12',
  lg: 'w-12 h-12 md:w-16 md:h-16',
};

/**
 * Flèche de transition pour montrer un changement d'état
 * Utilisé dans les slides d'onboarding pour montrer "avant → après"
 */
const colorClasses = {
  amber: 'text-amber-500',
  emerald: 'text-emerald-500',
} as const;

export function TransitionArrow({ size = 'md', color = 'amber', className }: Props) {
  return (
    <div className={clsx('flex items-center justify-center mb-4', className)}>
      <svg
        className={clsx(colorClasses[color], sizeClasses[size])}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
        aria-label="Devient"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

