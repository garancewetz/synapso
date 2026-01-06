'use client';

import type { ReactNode } from 'react';
import { MenuLink } from './MenuLink';

type Props = {
  title: string;
  icon: string | ReactNode;
  description: string;
  href?: string;
  onClick?: () => void;
  iconBgColor?: string;
  iconTextColor?: string;
  isSecondary?: boolean;
  /** Layout vertical (icône en haut) pour les grilles */
  variant?: 'horizontal' | 'vertical';
};

/**
 * Carte pour le plan du site
 * Design épuré sans chevron - l'interactivité est déjà claire via le style de carte
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
  variant = 'horizontal',
}: Props) {
  if (!href && !onClick) {
    throw new Error('SiteMapCard must have either href or onClick');
  }

  return (
    <MenuLink
      href={href || '#'}
      onClick={onClick}
      icon={icon}
      title={title}
      description={description}
      iconBgColor={iconBgColor}
      iconTextColor={iconTextColor}
      isSecondary={isSecondary}
      iconSize={isSecondary ? 'sm' : 'md'}
      variant={variant}
    />
  );
}

