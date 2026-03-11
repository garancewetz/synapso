'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ExerciceCategory } from '@/app/types/exercice';
import {
  CATEGORY_LABELS_SHORT,
  CATEGORY_ICONS,
  CATEGORY_MOBILE_STYLES,
  CATEGORY_HREFS,
} from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';

const CATEGORY_ORDER: ExerciceCategory[] = ['UPPER_BODY', 'CORE', 'LOWER_BODY', 'STRETCHING', 'FACE'];

export const BottomNavBar = memo(function BottomNavBar() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { preserveDate } = useLayoutContext();

  if (!effectiveUser || loading) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isSuiviActive = pathname === '/historique' || pathname.startsWith('/historique');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-60 md:hidden  bg-transparent "
      aria-label="Navigation principale"
    >
      <div className="grid grid-cols-5 grid-rows-2 gap-0 pt-2 ">
        <TouchLink
          href={preserveDate('/')}
          aria-label="Accueil"
          aria-current={isHomeActive ? 'page' : undefined}
          className={clsx(
            'flex flex-col items-center justify-center min-h-[48px] py-2 px-1 rounded-l-xl transition-all duration-200',
            'bg-white hover:opacity-90 active:opacity-95 rounded-tr-xl',
            'shadow-[4px_0_6px_-1px_rgba(0,0,0,0.08)]',
            isHomeActive ? 'text-gray-900' : 'text-gray-600'
          )}
        >
          <span className="text-xl" role="img" aria-hidden="true">
            {NAVIGATION_EMOJIS.HOME}
          </span>
          <span className="text-[10px] font-bold">Accueil</span>
        </TouchLink>

        <div aria-hidden="true" className="bg-transparent" />
        <div aria-hidden="true" className="bg-transparent" />
        <div aria-hidden="true" className="bg-transparent" />

        <TouchLink
          href={preserveDate('/historique')}
          aria-label="Suivi"
          aria-current={isSuiviActive ? 'page' : undefined}
          className={clsx(
            'flex flex-col items-center justify-center min-h-[48px] py-2 px-1 rounded-r-xl transition-all duration-200',
            'bg-white hover:opacity-90 active:opacity-95 rounded-tl-xl',
            'shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.08)]',
            isSuiviActive ? 'text-gray-900' : 'text-gray-600'
          )}
        >
          <span className="text-xl" role="img" aria-hidden="true">
            {NAVIGATION_EMOJIS.ROCKET}
          </span>
          <span className="text-[10px] font-bold">Suivi</span>
        </TouchLink>

        {CATEGORY_ORDER.map((category, index) => {
          const href = CATEGORY_HREFS[category];
          const isActive = pathname === href;
          const styles = CATEGORY_MOBILE_STYLES[category];
          const icon = CATEGORY_ICONS[category];
          const label = CATEGORY_LABELS_SHORT[category];
          const isCenterCell = index >= 1 && index <= 3;
          return (
            <TouchLink
              key={category}
              href={preserveDate(href)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'flex flex-col items-center justify-center min-h-[52px] py-2 px-1 gap-0.5 rounded-none transition-all duration-200',
                'bg-white hover:opacity-90 active:opacity-95',
                isCenterCell && 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  styles.iconBg
                )}
              >
                <span className={clsx('text-xl', styles.iconText)} role="img" aria-hidden="true">
                  {icon}
                </span>
              </div>
              <span className="text-[10px] font-bold truncate max-w-full text-gray-700">
                {label}
              </span>
            </TouchLink>
          );
        })}
      </div>
    </nav>
  );
});
