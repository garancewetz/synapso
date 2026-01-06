'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TouchLink } from '@/app/components/TouchLink';
import { ChevronIcon } from '@/app/components/ui/icons';

type Props = {
  href: string;
  onClick?: () => void;
  icon: string | ReactNode;
  title: string;
  description?: string;
  iconBgColor?: string;
  iconTextColor?: string;
  tabIndex?: number;
  noCardStyle?: boolean;
  /** Afficher une flèche chevron à droite */
  showChevron?: boolean;
  /** Style secondaire (bordure en pointillés, opacity réduite) */
  isSecondary?: boolean;
  /** Appliquer un margin left (pour items enfants) */
  isChild?: boolean;
  /** Couleur du ring personnalisé */
  ringColor?: string;
  /** Taille de l'icône (emoji ou ReactNode) */
  iconSize?: 'sm' | 'md' | 'lg';
};

export function MenuLink({
  href,
  onClick,
  icon,
  title,
  description,
  iconBgColor = 'bg-linear-to-br from-gray-100 to-gray-200',
  iconTextColor = 'text-gray-700',
  tabIndex,
  noCardStyle = false,
  showChevron = false,
  isSecondary = false,
  isChild = false,
  ringColor,
  iconSize = 'md',
}: Props) {
  const iconSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-2xl',
  };

  const content = (
    <>
      {/* Icône */}
      <span className={clsx(
        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
        noCardStyle
          ? 'group-hover:scale-105'
          : 'shadow-md group-hover:shadow-lg group-hover:scale-110',
        iconBgColor
      )}>
        {typeof icon === 'string' ? (
          <span 
            className={clsx(
              'transition-transform duration-200 flex items-center justify-center',
              noCardStyle ? '' : 'group-hover:scale-110',
              iconTextColor,
              iconSizeClasses[iconSize]
            )} 
            role="img" 
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : (
          <span className={clsx(
            'w-6 h-6 transition-transform duration-200 flex items-center justify-center',
            noCardStyle ? '' : 'group-hover:scale-110',
            iconTextColor
          )}>
            {icon}
          </span>
        )}
      </span>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <span className="block font-semibold text-base text-gray-900 group-hover:text-gray-950 transition-colors">
          {title}
        </span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors">
            {description}
          </p>
        )}
      </div>

      {/* Flèche (optionnelle) */}
      {showChevron && (
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          <ChevronIcon 
            direction="right"
            className={clsx(isSecondary ? 'w-5 h-5' : 'w-6 h-6')}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );

  return (
    <div className={clsx(
      isChild && 'ml-6 md:ml-8',
      isSecondary && 'opacity-90'
    )}>
      <TouchLink
        href={href}
        onClick={onClick}
        tabIndex={tabIndex}
        className={clsx(
          'group flex items-center gap-3 px-4 py-3.5 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
          noCardStyle
            ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] rounded-xl'
            : clsx(
                'bg-white border-2 rounded-xl text-gray-800 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                isChild ? 'border-gray-200' : 'border-gray-100',
                isSecondary && 'border-dashed'
              ),
          ringColor && `ring-2 ring-offset-2 ${ringColor}`
        )}
      >
        {content}
      </TouchLink>
    </div>
  );
}

