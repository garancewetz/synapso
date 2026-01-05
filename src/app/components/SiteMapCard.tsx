'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ChevronIcon } from '@/app/components/ui/icons';

type Props = {
  title: string;
  icon: string | ReactNode;
  description: string;
  href?: string;
  onClick?: () => void;
  iconBgColor?: string;
  iconTextColor?: string;
  isSecondary?: boolean;
  isChild?: boolean;
  ringColor?: string;
};

/**
 * Carte pour le plan du site
 * Affiche une section avec icône, titre, description et flèche
 */
export function SiteMapCard({
  title,
  icon,
  description,
  href,
  onClick,
  iconBgColor = 'bg-gradient-to-br from-gray-100 to-gray-200',
  iconTextColor = 'text-gray-700',
  isSecondary = false,
  isChild = false,
  ringColor,
}: Props) {
  const commonClasses = clsx(
    'block group',
    'bg-white border-2 rounded-xl transition-all duration-200',
    isChild ? 'border-gray-200' : 'border-gray-100',
    'hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
    isChild && 'border-l-4',
    isSecondary && 'border-dashed',
    ringColor && `ring-2 ring-offset-2 ${ringColor}`
  );

  const content = (
    <div className={clsx(
      'flex items-center gap-3',
      isSecondary ? 'px-4 py-3.5' : 'px-4 py-3.5'
    )}>
      {/* Icône */}
      <div className={clsx(
        'rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
        'shadow-md group-hover:shadow-lg group-hover:scale-110',
        iconBgColor,
        isSecondary ? 'w-12 h-12' : 'w-12 h-12'
      )}>
        {typeof icon === 'string' ? (
          <span 
            className={clsx(
              'transition-transform duration-200 flex items-center justify-center group-hover:scale-110',
              iconTextColor,
              isSecondary ? 'text-xl' : 'text-2xl'
            )} 
            role="img" 
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : (
          <span 
            className={clsx(
              'transition-transform duration-200 flex items-center justify-center group-hover:scale-110',
              iconTextColor
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <h2 className={clsx(
          'font-semibold mb-0.5',
          'text-gray-900 group-hover:text-gray-950 transition-colors',
          isSecondary ? 'text-base' : 'text-base'
        )}>
          {title}
        </h2>
        <p className={clsx(
          'text-gray-500 group-hover:text-gray-600 transition-colors',
          isSecondary ? 'text-xs' : 'text-xs'
        )}>
          {description}
        </p>
      </div>

      {/* Flèche */}
      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
        <ChevronIcon 
          direction="right"
          className={clsx(isSecondary ? 'w-5 h-5' : 'w-6 h-6')}
          aria-hidden="true"
        />
      </div>
    </div>
  );

  const wrapperClasses = clsx(
    isChild && 'ml-6 md:ml-8',
    isSecondary && 'opacity-90'
  );

  if (onClick) {
    return (
      <div className={wrapperClasses}>
        <button
          onClick={onClick}
          className={commonClasses}
          aria-label={title}
        >
          {content}
        </button>
      </div>
    );
  }

  if (!href) {
    throw new Error('SiteMapCard must have either href or onClick');
  }

  return (
    <div className={wrapperClasses}>
      <Link
        href={href}
        className={commonClasses}
        aria-label={title}
      >
        {content}
      </Link>
    </div>
  );
}

