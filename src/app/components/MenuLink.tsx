'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuLinkProps {
  href: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  description?: string;
  iconBgColor?: string;
  iconTextColor?: string;
  tabIndex?: number;
}

export default function MenuLink({
  href,
  onClick,
  icon,
  title,
  description,
  iconBgColor = 'bg-gradient-to-br from-gray-100 to-gray-200',
  iconTextColor = 'text-gray-700',
  tabIndex,
}: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      tabIndex={tabIndex}
      className="group flex items-center gap-3 px-4 py-3.5 text-gray-800 
                 bg-white border-2 border-gray-100 rounded-xl
                 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02]
                 active:scale-[0.98] transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
    >
      <span className={`
        w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center flex-shrink-0
        shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200
      `}>
        <span className={`w-6 h-6 ${iconTextColor} group-hover:scale-110 transition-transform duration-200 flex items-center justify-center`}>
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
    </Link>
  );
}

