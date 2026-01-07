import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TouchLink } from '@/app/components/TouchLink';

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
  /** Style secondaire (bordure en pointillés, opacity réduite) */
  isSecondary?: boolean;
  /** Taille de l'icône (emoji ou ReactNode) */
  iconSize?: 'sm' | 'md' | 'lg';
  /** Layout de la carte : horizontal (défaut) ou vertical (icône en haut) */
  variant?: 'horizontal' | 'vertical';
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
  isSecondary = false,
  iconSize = 'md',
  variant = 'horizontal',
}: Props) {
  const iconSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-2xl',
  };

  const isVertical = variant === 'vertical';

  const iconElement = (
    <span className={clsx(
      'rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
      isVertical ? 'w-11 h-11' : 'w-12 h-12',
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
            isVertical ? 'text-xl' : iconSizeClasses[iconSize]
          )} 
          role="img" 
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : (
        <span className={clsx(
          'transition-transform duration-200 flex items-center justify-center',
          isVertical ? 'w-5 h-5' : 'w-6 h-6',
          noCardStyle ? '' : 'group-hover:scale-110',
          iconTextColor
        )}>
          {icon}
        </span>
      )}
    </span>
  );

  const textElement = (
    <div className={clsx(isVertical ? 'text-center' : 'flex-1 min-w-0')}>
      <span className={clsx(
        'block font-semibold text-gray-900 group-hover:text-gray-950 transition-colors',
        isVertical ? 'text-sm' : 'text-base'
      )}>
        {title}
      </span>
      {description && (
        <p className={clsx(
          'text-gray-500 mt-0.5 group-hover:text-gray-600 transition-colors',
          isVertical ? 'text-[11px] leading-tight' : 'text-xs'
        )}>
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div className={clsx(isSecondary && 'opacity-90')}>
      <TouchLink
        href={href}
        onClick={onClick}
        tabIndex={tabIndex}
        className={clsx(
          'group transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
          isVertical
            ? 'flex flex-col items-center gap-2 px-3 py-4 text-center'
            : 'flex items-center gap-3 px-4 py-3.5',
          noCardStyle
            ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] rounded-xl'
            : clsx(
                'bg-white border-2 border-gray-100 rounded-xl text-gray-800 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                isSecondary && 'border-dashed'
              )
        )}
      >
        {iconElement}
        {textElement}
      </TouchLink>
    </div>
  );
}

