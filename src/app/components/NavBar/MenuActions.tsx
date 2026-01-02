'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { MenuLink } from '@/app/components';
import { PlusIcon, ChatIcon, SettingsIcon, MapIcon } from '@/app/components/ui/icons';
import { MENU_COLORS } from '@/app/constants/card.constants';
import type { User } from '@/app/types';

type Props = {
  currentUser: User | null;
  onMenuClose: () => void;
  isMenuOpen: boolean;
};

type MenuAction = {
  href: (pathname: string) => string;
  icon: React.ReactNode;
  title: string;
  iconBgColor: string;
  iconTextColor: string;
  condition?: (user: User | null) => boolean;
}

const MENU_ACTIONS: MenuAction[] = [
  {
    href: () => '/aphasie',
    icon: <ChatIcon />,
    title: 'Journal d\'aphasie',
    iconBgColor: MENU_COLORS.APHASIE.bg,
    iconTextColor: MENU_COLORS.APHASIE.text,
    condition: (user: User | null) => user?.isAphasic ?? false,
  },
  {
    href: (pathname: string) => `/exercice/add?from=${encodeURIComponent(pathname)}`,
    icon: <PlusIcon />,
    title: 'Ajouter un exercice',
    iconBgColor: MENU_COLORS.ADD_EXERCICE.bg,
    iconTextColor: MENU_COLORS.ADD_EXERCICE.text,
  },
  {
    href: () => '/historique',
    icon: <MapIcon className="w-5 h-5" />,
    title: 'Mon parcours',
    iconBgColor: MENU_COLORS.PARCOURS.bg,
    iconTextColor: MENU_COLORS.PARCOURS.text,
  },
  {
    href: () => '/settings',
    icon: <SettingsIcon />,
    title: 'Paramètres',
    iconBgColor: MENU_COLORS.SETTINGS.bg,
    iconTextColor: MENU_COLORS.SETTINGS.text,
  },
];

export function MenuActions({ currentUser, onMenuClose, isMenuOpen }: Props) {
  const pathname = usePathname();
  const tabIndex = isMenuOpen ? 0 : -1;

  // Filtrer les actions selon les conditions
  const visibleActions = useMemo(() => {
    return MENU_ACTIONS.filter((action) => {
      if (action.condition) {
        return action.condition(currentUser);
      }
      return true;
    });
  }, [currentUser]);

  return (
    <>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
        Actions
      </h3>
      {visibleActions.map((action) => {
        const href = typeof action.href === 'function' ? action.href(pathname) : action.href;

        return (
          <MenuLink
            key={action.title}
            href={href}
            onClick={onMenuClose}
            icon={action.icon}
            title={action.title}
            iconBgColor={action.iconBgColor}
            iconTextColor={action.iconTextColor}
            tabIndex={tabIndex}
          />
        );
      })}
    </>
  );
}

