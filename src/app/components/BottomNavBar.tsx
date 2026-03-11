'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  CATEGORY_LABELS_SHORT,
  CATEGORY_ICONS,
  CATEGORY_MOBILE_STYLES,
  CATEGORY_HREFS,
  CATEGORY_ORDER,
} from '@/app/constants/exercice.constants';
import type { ExerciceCategory } from '@/app/types/exercice';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

type Props = {
  /** Catégories à afficher en bas (celles utilisées par l'utilisateur). Si non fourni, toutes les catégories sont affichées. */
  categoriesToShow?: ExerciceCategory[];
};

export const BottomNavBar = memo(function BottomNavBar({ categoriesToShow = CATEGORY_ORDER }: Props) {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { preserveDate } = useLayoutContext();

  if (!effectiveUser || loading) {
    return null;
  }

  const isHomeActive = pathname === '/';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-60 md:hidden bg-transparent px-2 pb-2 touch-manipulation transform-[translateZ(0)]"
      aria-label="Navigation principale"
    >
      <div className="flex flex-col gap-1.5 pt-2">
        <div className="flex justify-start items-end">
          <TouchLink
            href={preserveDate('/')}
            aria-label="Accueil"
            aria-current={isHomeActive ? 'page' : undefined}
            className="flex flex-col items-start justify-end"
          >
            <div
              className={clsx(
                'flex flex-col items-center justify-center w-14 h-14 rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-200 hover:opacity-90 active:opacity-95',
                isHomeActive ? 'text-gray-900' : 'text-gray-600'
              )}
            >
              <span className="text-2xl leading-none" role="img" aria-hidden="true">
                {NAVIGATION_EMOJIS.HOME}
              </span>
              <span className="text-[10px] font-bold leading-tight">Accueil</span>
            </div>
          </TouchLink>
        </div>

        <div
          className={clsx(
            'backdrop-blur-md bg-white/80 border border-white/70 shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2',
            categoriesToShow.length > 3 ? 'justify-between' : 'justify-center'
          )}
        >
          {categoriesToShow.map((category) => {
            const href = CATEGORY_HREFS[category];
            const isActive = pathname === href;
            const styles = CATEGORY_MOBILE_STYLES[category];
            const icon = CATEGORY_ICONS[category];
            const label = CATEGORY_LABELS_SHORT[category];
            return (
              <TouchLink
                key={category}
                href={preserveDate(href)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'flex items-center justify-center p-1 rounded-2xl transition-all duration-200 bg-transparent',
                  'hover:opacity-90 active:opacity-95',
                  isActive && 'ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent'
                )}
              >
                <div
                  className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                    styles.iconBg
                  )}
                >
                  <span
                    className={clsx('text-2xl', styles.iconText)}
                    role="img"
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                </div>
              </TouchLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
