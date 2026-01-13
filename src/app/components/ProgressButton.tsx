'use client';

import clsx from 'clsx';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';

type Props = {
  onClick: () => void;
  variant?: 'fixed' | 'inline';
  position?: 'left' | 'right';
  label?: string;
};

const baseClasses = `
  bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
  rounded-full shadow-lg hover:shadow-xl hover:scale-105
  transition-all duration-200 cursor-pointer
  flex items-center justify-center gap-2
  text-amber-950 active:scale-95
`;

const variantClasses = {
  fixed: 'fixed bottom-28 md:bottom-8 z-40 w-auto h-14 md:h-auto px-4 md:px-5 py-3 font-semibold text-sm md:text-base',
  inline: 'w-auto h-auto px-3 py-2 md:px-4 md:py-2.5 font-bold text-sm',
};

/**
 * Bouton "Noter un progrès" réutilisable
 * 
 * Variantes :
 * - `fixed` : Bouton flottant fixe en bas de l'écran
 * - `inline` : Bouton standard pour intégration dans une page
 */
export function ProgressButton({ 
  onClick, 
  variant = 'inline',
  position = 'right',
  label = 'Ajouter'
}: Props) {
  const isFixed = variant === 'fixed';
  const positionClass = isFixed 
    ? (position === 'left' ? 'left-4 md:left-8 right-auto' : 'right-4 md:right-8 left-auto')
    : '';

  return (
    <button
      onClick={onClick}
      className={clsx(baseClasses, variantClasses[variant], positionClass)}
      aria-label="Noter un progrès"
    >
      <span className={isFixed ? 'text-xl' : 'text-lg'}>{PROGRESS_EMOJIS.STAR_BRIGHT}</span>
      {isFixed ? (
        <span className="whitespace-nowrap">Noter un progrès</span>
      ) : (
        <span className="hidden md:inline whitespace-nowrap">{label}</span>
      )}
    </button>
  );
}

