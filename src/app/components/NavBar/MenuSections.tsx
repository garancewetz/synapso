'use client';

import { MenuLink } from '@/app/components';
import { ChatIcon, MapIcon, PinIcon, BookIcon, SparklesIcon } from '@/app/components/ui/icons';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { MENU_COLORS } from '@/app/constants/card.constants';
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
        <div className="space-y-1.5">
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
          <div className="pl-4 space-y-1">
            <MenuLink
              title="Exercices ortho"
              icon={<PinIcon className="w-4 h-4" />}
              href="/aphasie/exercices"
              iconBgColor={SITEMAP_ICON_STYLES.default.bg}
              iconTextColor={SITEMAP_ICON_STYLES.default.text}
              onClick={onMenuClose}
              tabIndex={tabIndex}
              iconSize="sm"
              noCardStyle
            />
            <MenuLink
              title="Mes citations"
              icon={<BookIcon className="w-4 h-4" />}
              href="/aphasie/citations"
              iconBgColor={SITEMAP_ICON_STYLES.default.bg}
              iconTextColor={SITEMAP_ICON_STYLES.default.text}
              onClick={onMenuClose}
              tabIndex={tabIndex}
              iconSize="sm"
              noCardStyle
            />
          </div>
        </div>
      )}

      {/* Section Parcours */}
      <div className="space-y-1.5">
        <MenuLink
          title="Parcours"
          icon={<MapIcon className="w-4 h-4" />}
          href="/historique"
          iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
          iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
          onClick={onMenuClose}
          tabIndex={tabIndex}
          iconSize="sm"
          noCardStyle
        />
        <div className="pl-4 space-y-1">
          <MenuLink
            title="Mes progrès"
            icon={<SparklesIcon className="w-4 h-4" />}
            href="/historique#progres"
            iconBgColor={MENU_COLORS.PROGRES.bg}
            iconTextColor={MENU_COLORS.PROGRES.text}
            onClick={onMenuClose}
            tabIndex={tabIndex}
            iconSize="sm"
            noCardStyle
          />
          <MenuLink
            title="Statistiques"
            icon={<MapIcon className="w-4 h-4" />}
            href="/historique#statistiques"
            iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
            iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
            onClick={onMenuClose}
            tabIndex={tabIndex}
            iconSize="sm"
            noCardStyle
          />
        </div>
      </div>
    </>
  );
}
