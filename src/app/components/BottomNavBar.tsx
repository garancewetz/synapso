'use client';

import { memo, useState, useEffect, useCallback } from 'react';
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
import { MenuIcon, CloseIcon, MapIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import { useStopScrollOnTouch } from '@/app/hooks/useStopScrollOnTouch';
import { AddMenu } from '@/app/components/BottomNavBar/AddMenu';

type Props = {
  /** Catégories à afficher en bas (celles utilisées par l'utilisateur). Si non fourni, toutes les catégories sont affichées. */
  categoriesToShow?: ExerciceCategory[];
};

const PROGRESSION_HREF = '/historique';

export const BottomNavBar = memo(function BottomNavBar({ categoriesToShow = CATEGORY_ORDER }: Props) {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const {
    preserveDate,
    categoriesSlideOpen,
    setCategoriesSlideOpen,
  } = useLayoutContext();
  const stopScrollOnTouch = useStopScrollOnTouch();
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);

  const handleToggleCategoriesSlide = useCallback(() => {
    setCategoriesSlideOpen(!categoriesSlideOpen);
  }, [setCategoriesSlideOpen, categoriesSlideOpen]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopLayout(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isHomeActive = pathname === '/';
  const isProgressionActive = pathname === PROGRESSION_HREF || pathname.startsWith(`${PROGRESSION_HREF}/`);

  if (!effectiveUser || loading || isDesktopLayout) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-60 bg-transparent px-2 pb-2 touch-manipulation transform-[translateZ(0)]"
      aria-label="Navigation principale"
      onTouchStart={stopScrollOnTouch}
    >
      <div className={clsx('backdrop-blur-md bg-white/80 border border-white/70 shadow-lg rounded-2xl flex flex-col transition-all duration-300', categoriesSlideOpen ? 'pt-2 pb-2' : 'py-2')}>
        <div className={clsx('px-2 flex items-center justify-between gap-1', categoriesSlideOpen && 'pb-0')}>
          <TouchLink
            href={preserveDate('/')}
            aria-label="Accueil"
            aria-current={isHomeActive ? 'page' : undefined}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div className={clsx(
              'flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm bg-white/90 transition-all duration-200 hover:opacity-90 active:opacity-95 shrink-0 gap-0.5',
              isHomeActive ? 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent' : 'text-gray-600'
            )}>
              <span className="text-xl leading-none" role="img" aria-hidden="true">
                {NAVIGATION_EMOJIS.HOME}
              </span>
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Accueil</span>
            </div>
          </TouchLink>

          <button
            type="button"
            onClick={handleToggleCategoriesSlide}
            aria-label={categoriesSlideOpen ? 'Fermer les catégories' : 'Ouvrir les catégories'}
            aria-expanded={categoriesSlideOpen}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div
              className={clsx(
                'flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm bg-white/90 transition-all duration-200 hover:opacity-90 active:opacity-95 shrink-0 gap-0.5',
                categoriesSlideOpen
                  ? 'text-gray-700 bg-gray-100 border border-gray-200/60'
                  : 'text-gray-600'
              )}
            >
              {categoriesSlideOpen ? (
                <CloseIcon className="w-5 h-5 shrink-0" aria-hidden />
              ) : (
                <MenuIcon className="w-5 h-5 shrink-0" aria-hidden />
              )}
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Catégories</span>
            </div>
          </button>

          <AddMenu />

          <TouchLink
            href={preserveDate(PROGRESSION_HREF)}
            aria-label="Progression"
            aria-current={isProgressionActive ? 'page' : undefined}
            className="flex flex-col items-center justify-end shrink-0"
          >
            <div className={clsx(
              'flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm bg-white/90 transition-all duration-200 hover:opacity-90 active:opacity-95 shrink-0 gap-0.5',
              isProgressionActive ? 'text-gray-900 ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent' : 'text-gray-600'
            )}>
              <MapIcon className="w-5 h-5 shrink-0" aria-hidden />
              <span className="text-[10px] font-semibold leading-tight tracking-tight">Progression</span>
            </div>
          </TouchLink>
        </div>

        <div
          className={clsx(
            'overflow-hidden transition-[max-height] duration-300 ease-out',
            !categoriesSlideOpen && 'pointer-events-none'
          )}
          style={{ maxHeight: categoriesSlideOpen ? 72 : 0 }}
        >
          <div className={clsx('flex items-center px-2 pt-2 pb-2 rounded-b-2xl', categoriesToShow.length >= 4 ? 'justify-between gap-2' : 'justify-center gap-4')}>
            {categoriesToShow.map((category) => {
              const href = preserveDate(CATEGORY_HREFS[category]);
              const styles = CATEGORY_MOBILE_STYLES[category];
              const icon = CATEGORY_ICONS[category];
              const label = CATEGORY_LABELS_SHORT[category];
              const isActive = pathname === CATEGORY_HREFS[category];
              return (
                <TouchLink
                  key={category}
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex flex-col items-center justify-center shrink-0"
                >
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-200',
                      styles.iconBg,
                      styles.iconText,
                      isActive && 'ring-2 ring-gray-300 ring-offset-2 ring-offset-transparent'
                    )}
                  >
                    <span className="text-xl leading-none" role="img" aria-hidden="true">
                      {icon}
                    </span>
                  </div>
                </TouchLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
});
