'use client';

import { usePathname } from 'next/navigation';
import { MenuLink } from '@/app/components';
import { PlusIcon, SparklesIcon } from '@/app/components/ui/icons';
import { MENU_COLORS } from '@/app/constants/card.constants';

type Props = {
  onMenuClose: () => void;
  isMenuOpen: boolean;
};

type MenuAction = {
  href: (pathname: string) => string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  iconBgColor: string;
  iconTextColor: string;
}

function getMenuActions(): MenuAction[] {
  return [
    {
      href: (pathname: string) => `/exercice/add?from=${encodeURIComponent(pathname)}`,
      icon: <PlusIcon />,
      title: 'Ajouter un exercice',
      iconBgColor: MENU_COLORS.ADD_EXERCICE.bg,
      iconTextColor: MENU_COLORS.ADD_EXERCICE.text,
    },
    {
      href: () => '/historique?action=add-progress',
      icon: <SparklesIcon />,
      title: 'Noter un progrès',
      iconBgColor: MENU_COLORS.PROGRES.bg,
      iconTextColor: MENU_COLORS.PROGRES.text,
    },
  ];
}

export function MenuActions({ onMenuClose, isMenuOpen }: Props) {
  const pathname = usePathname();
  const tabIndex = isMenuOpen ? 0 : -1;

  const menuActions = getMenuActions();

  return (
    <>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
        Actions rapides
      </h3>
      {menuActions.map((action) => {
        const href = action.href(pathname);

        return (
          <MenuLink
            key={action.title}
            href={href}
            onClick={onMenuClose}
            icon={action.icon}
            title={action.title}
            description={action.description}
            iconBgColor={action.iconBgColor}
            iconTextColor={action.iconTextColor}
            tabIndex={tabIndex}
          />
        );
      })}
    </>
  );
}

