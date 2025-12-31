'use client';

import { usePathname } from 'next/navigation';
import { MenuLink } from '@/app/components';
import { PlusIcon, ClockIcon, BookIcon, SettingsIcon } from '@/app/components/ui/icons';
import type { User } from '@/app/types';

interface MenuActionsProps {
  currentUser: User | null;
  onMenuClose: () => void;
  isMenuOpen: boolean;
}

interface MenuAction {
  href: (pathname: string) => string;
  icon: React.ReactNode;
  title: string;
  iconBgColor: string;
  iconTextColor: string;
  condition?: (user: User | null) => boolean;
}

const MENU_ACTIONS: MenuAction[] = [
  {
    href: (pathname: string) => `/exercice/add?from=${encodeURIComponent(pathname)}`,
    icon: <PlusIcon />,
    title: 'Ajouter un exercice',
    iconBgColor: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    iconTextColor: 'text-white',
  },
  {
    href: () => '/historique',
    icon: <ClockIcon className="w-5 h-5" />,
    title: 'Historique',
    iconBgColor: 'bg-gradient-to-br from-amber-400 to-amber-600',
    iconTextColor: 'text-white',
  },
  {
    href: () => '/aphasie',
    icon: <BookIcon />,
    title: 'Journal d\'aphasie',
    iconBgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    iconTextColor: 'text-white',
    condition: (user: User | null) => user?.isAphasic ?? false,
  },
  {
    href: () => '/settings',
    icon: <SettingsIcon />,
    title: 'Paramètres',
    iconBgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    iconTextColor: 'text-white',
  },
];

export function MenuActions({ currentUser, onMenuClose, isMenuOpen }: MenuActionsProps) {
  const pathname = usePathname();
  const tabIndex = isMenuOpen ? 0 : -1;

  return (
    <>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
        Actions
      </h3>
      {MENU_ACTIONS.map((action) => {
        // Vérifier la condition si elle existe
        if (action.condition && !action.condition(currentUser)) {
          return null;
        }

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

