'use client';

import { MenuLink } from '@/app/components';
import { ChatIcon, MapIcon } from '@/app/components/ui/icons';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  onMenuClose: () => void;
  isMenuOpen: boolean;
};

export function MenuSections({ onMenuClose, isMenuOpen }: Props) {
  const { effectiveUser } = useUser();
  const isAphasic = effectiveUser?.isAphasic ?? false;
  const tabIndex = isMenuOpen ? 0 : -1;

  return (
    <>
      {/* Section Aphasie */}
      {isAphasic && (
        <MenuLink
          title="Aphasie"
          icon={<ChatIcon className="w-4 h-4" />}
          href="/aphasie"
          iconBgColor={SITEMAP_ICON_STYLES.primary.aphasie.bg}
          iconTextColor={SITEMAP_ICON_STYLES.primary.aphasie.text}
          onClick={onMenuClose}
          tabIndex={tabIndex}
          iconSize="sm"
          noCardStyle
        />
      )}

      {/* Section Parcours */}
      <MenuLink
        title="Mon parcours"
        icon={<MapIcon className="w-4 h-4" />}
        href="/historique"
        iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
        iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
        onClick={onMenuClose}
        tabIndex={tabIndex}
        iconSize="sm"
        noCardStyle
      />
    </>
  );
}
