'use client';

import { MenuLink } from '@/app/components';
import { MapIcon, SparklesIcon } from '@/app/components/ui/icons';
import { MENU_COLORS } from '@/app/constants/card.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { usePreserveDateParam } from '@/app/features/time-machine/hooks/usePreserveDateParam';

export function HomeProgressionTab() {
  const preserveDate = usePreserveDateParam();
  const historiqueBase = preserveDate('/historique');
  const separator = historiqueBase.includes('?') ? '&' : '?';

  return (
    <div className="space-y-3">
      <MenuLink
        title="Voir mes progrès"
        icon={<SparklesIcon className="w-5 h-5" />}
        description="Tous mes progrès et leur évolution dans le temps"
        href={`${historiqueBase}${separator}tab=progres`}
        iconBgColor={MENU_COLORS.PROGRES.bg}
        iconTextColor={MENU_COLORS.PROGRES.text}
      />
      <MenuLink
        title="Voir mes Statistiques"
        icon={<MapIcon className="w-5 h-5" />}
        description="Mon activité, mes graphiques et les zones travaillées"
        href={`${historiqueBase}${separator}tab=statistiques`}
        iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
        iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
      />
    </div>
  );
}
