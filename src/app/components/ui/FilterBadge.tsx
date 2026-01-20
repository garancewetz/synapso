'use client';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        'h-8 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'active:scale-[0.98]',
        isActive
          ? clsx(
              categoryColors.accent,
              'text-white shadow-md',
              categoryColors.focusRing.replace('focus:', 'ring-')
            )
          : clsx(
              categoryColors.bg,
              categoryColors.text,
              'border',
              categoryColors.border,
              'hover:shadow-sm hover:brightness-105'
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

