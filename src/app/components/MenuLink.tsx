'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuLinkProps {
  href: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconTextColor?: string;
}

export default function MenuLink({
  href,
  onClick,
  icon,
  title,
  description,
  iconBgColor = 'bg-gray-100',
  iconTextColor = 'text-gray-600',
}: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
    >
      <span className={`w-10 h-10 ${iconBgColor} rounded-xl flex items-center justify-center`}>
        <span className={`w-5 h-5 ${iconTextColor}`}>{icon}</span>
      </span>
      <div>
        <span className="font-medium">{title}</span>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

