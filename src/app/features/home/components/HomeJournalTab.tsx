import { MenuLink } from '@/app/components';
import { BookIcon } from '@/app/components/ui/icons';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';

export function HomeJournalTab() {
  return (
    <MenuLink
      title="Journal"
      icon={<BookIcon className="w-5 h-5" />}
      description="Mes notes"
      href="/journal"
      iconBgColor={SITEMAP_ICON_STYLES.primary.journal.bg}
      iconTextColor={SITEMAP_ICON_STYLES.primary.journal.text}
    />
  );
}
