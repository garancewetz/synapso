'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  icon?: string | ReactNode;
  count: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
};

/**
 * Badge de filtre pour les équipements
 * Utilise le même style que FilterBadge mais avec des couleurs neutres (gris)
 */
export function EquipmentFilterBadge({
  label,
  icon,
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

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'h-8 px-3 py-1 rounded-lg text-xs font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
        'active:scale-[0.99]',
        isActive
          ? 'bg-gray-800 text-white ring-2 ring-offset-1 ring-gray-400'
          : clsx(
              'bg-white text-gray-700 border border-gray-200',
              // Ring uniquement au hover sur desktop, pas au repos
              'md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
            )
      )}
      aria-label={ariaLabel || `Filtrer par ${label} (${count} exercice${count > 1 ? 's' : ''})`}
      aria-pressed={isActive}
    >
      <span className="flex items-center gap-1.5">
        {icon && <span className="text-sm flex items-center">{typeof icon === 'string' ? icon : icon}</span>}
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

