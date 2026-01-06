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
  isChild?: boolean;
  ringColor?: string;
};

/**
 * Carte pour le plan du site
 * Wrapper autour de MenuLink avec showChevron activé par défaut
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
      showChevron={true}
      isSecondary={isSecondary}
      isChild={isChild}
      ringColor={ringColor}
      iconSize={isSecondary ? 'sm' : 'md'}
    />
  );
}

