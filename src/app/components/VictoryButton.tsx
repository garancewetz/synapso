'use client';

import clsx from 'clsx';
import { VICTORY_EMOJIS } from '@/app/constants/emoji.constants';

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
  fixed: 'fixed bottom-24 md:bottom-8 z-40 w-14 h-14 md:w-auto md:h-auto md:px-5 md:py-3 font-semibold',
  inline: 'w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2.5 font-bold text-sm',
};

/**
 * Bouton "Noter une victoire" réutilisable
 * 
 * Variantes :
 * - `fixed` : Bouton flottant fixe en bas de l'écran
 * - `inline` : Bouton standard pour intégration dans une page
 */
export default function VictoryButton({ 
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
      aria-label="Noter une victoire"
    >
      <span className={isFixed ? 'text-xl' : 'text-lg'}>{VICTORY_EMOJIS.STAR_BRIGHT}</span>
      <span className="hidden md:inline">
        {isFixed ? 'Noter une victoire' : label}
      </span>
    </button>
  );
}

