'use client';

import { MenuLink } from '@/app/components';
import { BookIcon, RocketIcon } from '@/app/components/ui/icons';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  onMenuClose: () => void;
  isMenuOpen: boolean;
};

export function MenuSections({ onMenuClose, isMenuOpen }: Props) {
  const { effectiveUser } = useUser();
  const hasJournal = effectiveUser?.hasJournal ?? false;
  const tabIndex = isMenuOpen ? 0 : -1;

  return (
    <>
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
      {hasJournal && (
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
      )}
    </>
  );
}
