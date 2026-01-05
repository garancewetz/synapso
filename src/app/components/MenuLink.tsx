'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TouchLink } from '@/app/components/TouchLink';

type Props = {
  href: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  description?: string;
  iconBgColor?: string;
  iconTextColor?: string;
  tabIndex?: number;
  noCardStyle?: boolean;
};

export default function MenuLink({
  href,
  onClick,
  icon,
  title,
  description,
  iconBgColor = 'bg-gradient-to-br from-gray-100 to-gray-200',
  iconTextColor = 'text-gray-700',
  tabIndex,
  noCardStyle = false,
}: Props) {
  return (
    <TouchLink
      href={href}
      onClick={onClick}
      tabIndex={tabIndex}
      className={clsx(
        'group flex items-center gap-3 px-4 py-3.5 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
        noCardStyle
          ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] rounded-xl'
          : 'bg-white border-2 border-gray-100 text-gray-800 rounded-xl hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <span className={clsx(
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
        noCardStyle
          ? 'group-hover:scale-105'
          : 'shadow-md group-hover:shadow-lg group-hover:scale-110',
        iconBgColor
      )}>
        <span className={clsx(
          'w-6 h-6 transition-transform duration-200 flex items-center justify-center',
          noCardStyle ? '' : 'group-hover:scale-110',
          iconTextColor
        )}>
          {icon}
        </span>
      </span>
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
    </TouchLink>
  );
}

