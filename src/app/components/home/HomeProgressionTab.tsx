import { MenuLink } from '@/app/components';
import { MapIcon, SparklesIcon, PlusIcon } from '@/app/components/ui/icons';
import { MENU_COLORS } from '@/app/constants/card.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';

export function HomeProgressionTab() {
  return (
    <div className="space-y-3">
      <MenuLink
        title="Voir mes progrès"
        icon={<SparklesIcon className="w-5 h-5" />}
        description="Tous mes progrès et leur évolution dans le temps"
        href="/historique#progres"
        iconBgColor={MENU_COLORS.PROGRES.bg}
        iconTextColor={MENU_COLORS.PROGRES.text}
      />
      <MenuLink
        title="Voir mes Statistiques"
        icon={<MapIcon className="w-5 h-5" />}
        description="Mon activité, mes graphiques et les zones travaillées"
        href="/historique#statistiques"
        iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
        iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
      />
      <MenuLink
        title="Noter un progrès"
        icon={<PlusIcon className="w-5 h-5" />}
        description="Célébrer une nouvelle réussite ou victoire"
        href="/historique?action=add-progress"
        iconBgColor={MENU_COLORS.PROGRES.bg}
        iconTextColor={MENU_COLORS.PROGRES.text}
      />
    </div>
  );
}
