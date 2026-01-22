'use client';

import { useCallback } from 'react';
import clsx from 'clsx';
import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';

type Props = {
  label: string;
  icon?: string;
  count: number;
  isActive: boolean;
  category: ExerciceCategory;
  onClick: () => void;
  ariaLabel?: string;
};

/**
 * Badge de filtre pour les parties du corps
 * Utilise les couleurs de la catégorie pour la cohérence visuelle
 */
export function FilterBadge({
  label,
  icon,
  count,
  isActive,
  category,
  onClick,
  ariaLabel,
}: Props) {
  const categoryColors = CATEGORY_COLORS[category];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  // Mapping des couleurs de catégorie vers les classes de ring hover
  const ringHoverMap: Record<ExerciceCategory, string> = {
    UPPER_BODY: 'md:hover:ring-orange-300/50',
    CORE: 'md:hover:ring-teal-300/50',
    LOWER_BODY: 'md:hover:ring-blue-300/50',
    STRETCHING: 'md:hover:ring-purple-300/50',
  };

  // Extraire la couleur du ring depuis focusRing (ex: "focus:ring-orange-500" -> "ring-orange-500")
  const activeRingColor = categoryColors.focusRing.replace('focus:', '');

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'h-8 px-3 py-1 rounded-lg text-xs font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        categoryColors.focusRing,
        'active:scale-[0.99]',
        isActive
          ? clsx(
              categoryColors.accent,
              'text-white ring-2 ring-offset-1',
              activeRingColor
            )
          : clsx(
              categoryColors.bg,
              categoryColors.text,
              'border',
              categoryColors.border,
              // Ring uniquement au hover sur desktop, pas au repos
              ringHoverMap[category],
              'md:hover:ring-2 md:hover:ring-offset-2'
            )
      )}
      aria-label={ariaLabel || `Filtrer par ${label} (${count} exercice${count > 1 ? 's' : ''})`}
      aria-pressed={isActive}
    >
      <span className="flex items-center gap-1.5">
        {icon && <span className="text-sm">{icon}</span>}
        <span>{label}</span>
        <span
          className={clsx(
            'text-[10px] font-bold px-1 py-0.5 rounded',
            isActive
              ? 'bg-white/20 text-white'
              : clsx(categoryColors.tag, 'opacity-90')
          )}
        >
          {count}
        </span>
      </span>
    </button>
  );
}

