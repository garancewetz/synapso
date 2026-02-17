'use client';

import { memo } from 'react';
import { MenuLink } from '@/app/components';
import { BookIcon, MapIcon, SparklesIcon } from '@/app/components/ui/icons';
import { MENU_COLORS } from '@/app/constants/card.constants';
import { SITEMAP_ICON_STYLES } from '@/app/constants/sitemap.constants';
import { usePreserveDateParam } from '@/app/features/time-machine/hooks/usePreserveDateParam';
import { useUser } from '@/app/contexts/UserContext';

export const HomePlusTab = memo(function HomePlusTab() {
  const preserveDate = usePreserveDateParam();
  const { effectiveUser } = useUser();
  const hasJournal = effectiveUser?.hasJournal ?? false;

  return (
    <div className="space-y-3">
      <MenuLink
        title="Mes progrès"
        icon={<SparklesIcon className="w-5 h-5" />}
        description="Tous mes progrès et leur évolution dans le temps"
        href={preserveDate('/historique#progres')}
        iconBgColor={MENU_COLORS.PROGRES.bg}
        iconTextColor={MENU_COLORS.PROGRES.text}
      />
      <MenuLink
        title="Mes statistiques"
        icon={<MapIcon className="w-5 h-5" />}
        description="Mon activité, mes graphiques et les zones travaillées"
        href={preserveDate('/historique#statistiques')}
        iconBgColor={SITEMAP_ICON_STYLES.primary.parcours.bg}
        iconTextColor={SITEMAP_ICON_STYLES.primary.parcours.text}
      />
      {hasJournal && (
        <MenuLink
          title="Journal"
          icon={<BookIcon className="w-5 h-5" />}
          description="Mes notes et réflexions"
          href="/journal"
          iconBgColor={SITEMAP_ICON_STYLES.primary.journal.bg}
          iconTextColor={SITEMAP_ICON_STYLES.primary.journal.text}
        />
      )}
    </div>
  );
});
