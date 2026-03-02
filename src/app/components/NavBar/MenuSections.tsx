'use client';

import { MenuLink } from '@/app/components';
import { BellIcon, BookIcon, RocketIcon } from '@/app/components/ui/icons';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

type Props = {
  onMenuClose: () => void;
  isMenuOpen: boolean;
};

export function MenuSections({ onMenuClose, isMenuOpen }: Props) {
  const tabIndex = isMenuOpen ? 0 : -1;
  const { notificationBadge } = useLayoutContext();

  return (
    <>
       <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
        Sections principales
      </h3>
      {/* Section Progression */}
      <MenuLink
        title="Ma progression"
        icon={<RocketIcon className="w-4 h-4" />}
        href="/historique"
        iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
        iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
        onClick={onMenuClose}
        tabIndex={tabIndex}
        iconSize="sm"
        noCardStyle
      />

      {/* Section Journal */}
      <MenuLink
        title="Journal"
        icon={<BookIcon className="w-4 h-4" />}
        href="/journal"
        iconBgColor={SITEMAP_ICON_STYLES.primary.journal.bg}
        iconTextColor={SITEMAP_ICON_STYLES.primary.journal.text}
        onClick={onMenuClose}
        tabIndex={tabIndex}
        iconSize="sm"
        noCardStyle
      />

      {/* Section Notifications */}
      <div className="relative">
        <MenuLink
          title="Notifications"
          icon={<BellIcon className="w-4 h-4" />}
          href="/notifications"
          iconBgColor="bg-red-500"
          iconTextColor="text-white"
          onClick={onMenuClose}
          tabIndex={tabIndex}
          iconSize="sm"
          noCardStyle
        />
        {notificationBadge}
      </div>
    </>
  );
}
