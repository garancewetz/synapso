import { SiteMapGroup, MenuLink } from '@/app/components';
import { BookIcon, PinIcon } from '@/app/components/ui/icons';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';

export function HomeJournalTab() {
  return (
    <SiteMapGroup
      title="Journal"
      icon={<BookIcon className="w-5 h-5" />}
      description="Mes tâches et mes notes"
      href="/journal"
      iconBgColor={SITEMAP_ICON_STYLES.primary.journal.bg}
      iconTextColor={SITEMAP_ICON_STYLES.primary.journal.text}
    >
      <MenuLink
        title="Tâches"
        icon={<PinIcon className="w-5 h-5" />}
        description="Voir mes tâches"
        href="/journal/tasks"
        iconBgColor={SITEMAP_ICON_STYLES.default.bg}
        iconTextColor={SITEMAP_ICON_STYLES.default.text}
      />
      <MenuLink
        title="Mes notes"
        icon={<BookIcon className="w-5 h-5" />}
        description="Voir toutes"
        href="/journal/notes"
        iconBgColor={SITEMAP_ICON_STYLES.default.bg}
        iconTextColor={SITEMAP_ICON_STYLES.default.text}
      />
    </SiteMapGroup>
  );
}
