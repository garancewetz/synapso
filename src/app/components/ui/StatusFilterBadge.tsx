'use client';

import { useCallback } from 'react';
import clsx from 'clsx';

type StatusFilterType = 'all' | 'notCompleted' | 'completed';

type Props = {
  value: StatusFilterType;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
};

/**
 * Badge de filtre pour l'état des exercices (Tous / Non faits / Faits)
 * Utilise un ring vert pour "Faits" (sémantique du succès) et gris pour les autres
 */
export function StatusFilterBadge({
  value,
  label,
  count,
  isActive,
  onClick,
  ariaLabel,
}: Props) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  // Ring vert pour "Faits" (sémantique du succès), gris pour les autres
  const isCompletedFilter = value === 'completed';
  const focusRingColor = isCompletedFilter ? 'focus:ring-emerald-500' : 'focus:ring-gray-400';
  const activeRingColor = isCompletedFilter ? 'ring-emerald-500' : 'ring-gray-400';
  const hoverRingColor = isCompletedFilter ? 'md:hover:ring-emerald-300/50' : 'md:hover:ring-gray-300/50';

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'h-8 px-3 py-1 rounded-lg text-xs font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        focusRingColor,
        'active:scale-[0.99]',
        isActive
          ? clsx(
              isCompletedFilter ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-white',
              'ring-2 ring-offset-1',
              activeRingColor
            )
          : clsx(
              'bg-white text-gray-700 border border-gray-200',
              // Ring uniquement au hover sur desktop, pas au repos
              hoverRingColor,
              'md:hover:ring-2 md:hover:ring-offset-2'
            )
      )}
      aria-label={ariaLabel || `Filtrer par ${label} (${count} exercice${count > 1 ? 's' : ''})`}
      aria-pressed={isActive}
    >
      <span className="flex items-center gap-1.5">
        <span>{label}</span>
        <span
          className={clsx(
            'text-[10px] font-bold px-1 py-0.5 rounded',
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600 opacity-90'
          )}
        >
          {count}
        </span>
      </span>
    </button>
  );
}

