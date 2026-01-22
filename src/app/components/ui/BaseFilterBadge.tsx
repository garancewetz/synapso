'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type FilterBadgeColors = {
  // Couleurs pour l'état actif
  activeBg: string;
  activeRing: string;
  // Couleurs pour l'état inactif
  inactiveBg: string;
  inactiveText: string;
  inactiveBorder: string;
  inactiveTag: string;
  // Couleur du focus ring
  focusRing: string;
};

type Props = {
  label: string;
  icon?: string | ReactNode;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
  colors: FilterBadgeColors;
};

/**
 * Composant de base unifié pour tous les badges de filtre
 * Centralise la logique commune et permet de personnaliser les couleurs
 */
export function BaseFilterBadge({
  label,
  icon,
  count,
  isActive,
  onClick,
  ariaLabel,
  colors,
}: Props) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  // Extraire la couleur du ring depuis focusRing (ex: "focus:ring-orange-500" -> "ring-orange-500")
  const activeRingColor = colors.focusRing.replace('focus:', '');

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'h-8 px-3 py-1 rounded-lg text-xs font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        colors.focusRing,
        // Border toujours présente pour éviter le décalage
        'border',
        isActive
          ? clsx(
              colors.activeBg,
              'text-white border-transparent ring-2 ring-offset-2',
              activeRingColor
            )
          : clsx(
              colors.inactiveBg,
              colors.inactiveText,
              colors.inactiveBorder
            )
      )}
      aria-label={ariaLabel || (count !== undefined ? `Filtrer par ${label} (${count} exercice${count > 1 ? 's' : ''})` : `Filtrer par ${label}`)}
      aria-pressed={isActive}
    >
      <span className="flex items-center gap-1.5">
        {icon && <span className="text-sm flex items-center">{typeof icon === 'string' ? icon : icon}</span>}
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={clsx(
              'text-[10px] font-bold px-1 py-0.5 rounded',
              isActive
                ? 'bg-white/20 text-white'
                : clsx(colors.inactiveTag, 'opacity-90')
            )}
          >
            {count}
          </span>
        )}
      </span>
    </button>
  );
}

