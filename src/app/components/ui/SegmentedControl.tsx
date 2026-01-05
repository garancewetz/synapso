'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Si true, les boutons prennent toute la largeur disponible */
  fullWidth?: boolean;
  /** Taille du composant */
  size?: 'sm' | 'md';
  className?: string;
  /** Couleur du ring pour l'onglet actif (ex: 'ring-blue-500') */
  activeRingColor?: string;
};

/**
 * Extrait l'emoji et le texte d'un label
 */
function parseLabel(label: string): { emoji: string; text: string } {
  // Regex pour détecter les emojis (caractères Unicode emoji)
  const emojiRegex = /^(\p{Emoji}+)\s*(.+)$/u;
  const match = label.match(emojiRegex);
  
  if (match) {
    return {
      emoji: match[1],
      text: match[2],
    };
  }
  
  return {
    emoji: '',
    text: label,
  };
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth = false,
  size = 'sm',
  className = '',
  activeRingColor,
}: Props<T>) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2.5 text-sm',
  };

  return (
    <div className={clsx('flex bg-gray-100 rounded-lg p-1', className)}>
      {options.map((option) => {
        const { emoji, text } = parseLabel(option.label);
        const isActive = value === option.value;
        const hasIcon = option.icon || emoji;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              fullWidth && 'flex-1',
              sizeClasses[size],
              'rounded-md transition-all duration-200 relative',
              isActive
                ? clsx(
                    'bg-white text-gray-800 shadow-lg font-bold',
                    activeRingColor ? `ring-2 ring-offset-1 ${activeRingColor}` : ''
                  )
                : 'font-medium text-gray-500 hover:text-gray-700',
              // Sur mobile : disposition verticale (icône en haut, texte en bas)
              // Sur desktop : disposition horizontale (icône et texte côte à côte)
              hasIcon && 'flex flex-col items-center justify-center gap-0.5',
              !hasIcon && 'flex items-center justify-center'
            )}
          >
            {option.icon ? (
              <span className="w-5 h-5 md:w-4 md:h-4 md:mr-1.5 flex items-center justify-center" aria-hidden="true">
                {option.icon}
              </span>
            ) : emoji ? (
              <span className="text-lg md:text-base md:mr-1.5" role="img" aria-hidden="true">
                {emoji}
              </span>
            ) : null}
            <span className="text-xs md:text-sm leading-tight">{text}</span>
          </button>
        );
      })}
    </div>
  );
}

