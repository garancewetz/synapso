'use client';

import { forwardRef } from 'react';
import type { ReactNode, MouseEventHandler } from 'react';
import { TouchLink } from '@/app/components/TouchLink';
import { usePathname } from 'next/navigation';
import { PlusIcon } from './icons';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import clsx from 'clsx';

type ActionButtonProps = {
  variant?: 'golden' | 'simple';
  /** 'fixed' = bouton flottant (FAB), 'inline' = intégré dans la page */
  layout?: 'fixed' | 'inline';
  position?: 'left' | 'right';
  label?: string;
  className?: string;
  children?: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  // Pour les liens (AddButton)
  href?: string;
  queryParams?: Record<string, string>;
  addFromParam?: boolean;
  // Pour les boutons (ProgressButton)
  onClick?: MouseEventHandler<HTMLButtonElement>;
  'aria-label'?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

/**
 * Bouton d'action unifié - Gros bouton CTA (add/progrès)
 *
 * Layout :
 * - `fixed` : Bouton flottant fixe en bas de l'écran (FAB)
 * - `inline` : Bouton standard pour intégration dans une page
 *
 * Utilisé via AddButton (variant="simple") et ProgressButton (variant="golden").
 * Utiliser directement uniquement pour un FAB custom.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton({
  variant,
  layout = 'inline',
  position,
  label,
  className = '',
  children,
  icon,
  iconPosition = 'left',
  href,
  queryParams,
  addFromParam = false,
  onClick,
  'aria-label': ariaLabel,
  type = 'button',
  disabled = false,
}, ref) {
  const pathname = usePathname();
  const { effectiveUser } = useUser();
  const { navMenuType } = useLayoutContext();
  const isFixed = layout === 'fixed';

  if (isFixed && navMenuType === 'slide') {
    return null;
  }
  const isLink = !!href;
  const isProgress = variant === 'golden';
  const effectivePosition: 'left' | 'right' = position
    ? position
    : effectiveUser?.dominantHand === 'LEFT'
      ? 'left'
      : 'right';

  // Construire l'URL avec les paramètres de requête pour les liens
  let finalHref = href;
  if (isLink && (queryParams || addFromParam)) {
    const params = new URLSearchParams();
    
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    
    if (addFromParam && pathname) {
      params.set('from', pathname);
    }
    
    finalHref = `${href}?${params.toString()}`;
  }

  const positionClass = isFixed 
    ? (effectivePosition === 'left' ? 'left-4 md:left-8 right-auto' : 'right-4 md:right-8 left-auto')
    : '';

  const baseStyles = 'flex items-center justify-center gap-2 cursor-pointer font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';
  
  const sizeStyles = isFixed ? 'px-4 h-11 text-sm' : 'px-5 h-11 text-base' 

  const variantStyles = variant === 'golden'
    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 md:hover:from-amber-500 md:hover:via-yellow-500 md:hover:to-amber-600 shadow-lg md:hover:ring-2 md:hover:ring-amber-400/60 md:hover:ring-offset-2'
    : 'bg-gray-800 text-white md:hover:bg-gray-700 md:hover:ring-2 md:hover:ring-gray-400/60 md:hover:ring-offset-2';

  const buttonContent = (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        sizeStyles,
        variantStyles,
        'transition-all duration-200 ease-out active:scale-[0.97] select-none',
        !isLink && isFixed && 'action-button-fab fixed bottom-22 md:bottom-8 z-60 font-semibold',
        isLink && 'w-auto px-4 md:px-5 shadow-md',
        isLink && 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
        !isLink && positionClass,
        className
      )}
      style={{ touchAction: 'manipulation' }}
      aria-label={ariaLabel || (isProgress ? 'Noter un progrès' : label || 'Ajouter')}
    >
      {variant === 'golden' && iconPosition === 'left' && (
        <span className={clsx(isFixed ? 'text-xl' : 'text-lg')}>{icon ?? PROGRESS_EMOJIS.STAR_BRIGHT}</span>
      )}
      {variant === 'simple' && (
        <PlusIcon className={clsx(isFixed ? 'w-5 h-5' : 'w-6 h-6 md:w-7 md:h-7')} strokeWidth={3} />
      )}
      {children || (
        <>
          {isFixed && isProgress ? (
            <span className="whitespace-nowrap">Noter un progrès</span>
          ) : isFixed && label ? (
            <span className="whitespace-nowrap">{label}</span>
          ) : isProgress && !isFixed ? (
            <span className="whitespace-nowrap">{label || 'Ajouter'}</span>
          ) : label ? (
            <span className="whitespace-nowrap">{label}</span>
          ) : null}
        </>
      )}
      {variant === 'golden' && iconPosition === 'right' && (
        <span className={clsx(isFixed ? 'text-xl' : 'text-lg')}>{icon ?? PROGRESS_EMOJIS.STAR_BRIGHT}</span>
      )}
    </button>
  );

  if (isLink) {
    const linkClassName = isFixed 
      ? clsx('block', 'action-button-fab fixed bottom-20 md:bottom-8 z-60', positionClass)
      : 'inline-block';
    
    return (
      <TouchLink 
        href={finalHref!}
        className={linkClassName}
        aria-label={ariaLabel || label || 'Ajouter'}
      >
        {buttonContent}
      </TouchLink>
    );
  }

  return buttonContent;
});

