'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';
import { useSlidingIndicator } from '@/app/hooks/useSlidingIndicator';

type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Nombre optionnel à afficher sous le label (ex: nombre de résultats) */
  count?: number;
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
  /** Si true, affiche le count sur une ligne séparée (style Victory) */
  showCountBelow?: boolean;
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
  showCountBelow = false,
}: Props<T>) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2.5 text-sm',
  };

  // Trouver l'index actif
  const activeIndex = options.findIndex((option) => option.value === value);

  // Utiliser le hook pour l'animation de glissement horizontal
  const { itemsRef, indicatorStyle, isReady } = useSlidingIndicator(
    activeIndex,
    'horizontal',
    [options.length]
  );

  return (
    <div className={clsx('relative flex bg-gray-100 rounded-lg p-1', className)}>
      {/* Élément de fond qui glisse */}
      <span
        className="absolute flex overflow-hidden rounded-md transition-all duration-300 ease-out pointer-events-none"
        style={{ 
          ...indicatorStyle,
          top: '0.25rem',
          bottom: '0.25rem',
          opacity: isReady ? 1 : 0,
          transitionProperty: 'left, width, opacity'
        }}
      >
        <span className={clsx(
          'h-full w-full rounded-md bg-white shadow-lg',
          activeRingColor && `ring-2 ring-offset-1 ${activeRingColor}`
        )} />
      </span>

      {options.map((option, index) => {
        const { emoji, text } = parseLabel(option.label);
        const isActive = value === option.value;
        const hasIcon = option.icon || emoji;
        const hasCount = option.count !== undefined;
        
        return (
          <button
            key={option.value}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            onClick={() => onChange(option.value)}
            className={clsx(
              fullWidth && 'flex-1',
              sizeClasses[size],
              'rounded-md transition-colors duration-200 relative z-10 cursor-pointer',
              isActive
                ? 'text-gray-800 font-bold'
                : 'font-medium text-gray-500 hover:text-gray-700',
              // Disposition verticale pour icônes ou counts
              (hasIcon || showCountBelow) && 'flex flex-col items-center justify-center gap-0.5',
              !hasIcon && !showCountBelow && 'flex items-center justify-center'
            )}
          >
            {/* Icône */}
            {option.icon ? (
              <span className={clsx(
                'flex items-center justify-center',
                showCountBelow ? 'text-lg mb-1' : 'w-5 h-5 md:w-4 md:h-4 md:mr-1.5'
              )} aria-hidden="true">
                {option.icon}
              </span>
            ) : emoji ? (
              <span className={clsx(
                showCountBelow ? 'text-lg mb-1' : 'text-lg md:text-base md:mr-1.5'
              )} role="img" aria-hidden="true">
                {emoji}
              </span>
            ) : null}
            
            {/* Label */}
            <span className="text-xs md:text-sm leading-tight">{text}</span>
            
            {/* Count (si présent et showCountBelow activé) */}
            {hasCount && showCountBelow && (
              <span className="text-xs mt-0.5 opacity-75">({option.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

