'use client';

import { memo, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { ChevronIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import { ExercisesCategoryBar } from '@/app/components/ExercisesCategoryBar';

const SUIVI_EMOJI = '📈';

export const BottomNavBar = memo(function BottomNavBar() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { preserveDate, isCategoryBarOpen, setCategoryBarOpen } = useLayoutContext();

  const closedByPointerDownRef = useRef(false);
  const openCategoryBar = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setCategoryBarOpen(true);
  }, [setCategoryBarOpen]);
  const closeCategoryBar = useCallback(() => setCategoryBarOpen(false), [setCategoryBarOpen]);
  const handlePointerDownWhenOpen = useCallback(() => {
    closedByPointerDownRef.current = true;
    closeCategoryBar();
  }, [closeCategoryBar]);
  const handleClick = useCallback(() => {
    if (closedByPointerDownRef.current) {
      closedByPointerDownRef.current = false;
      return;
    }
    if (isCategoryBarOpen) {
      closeCategoryBar();
    } else {
      openCategoryBar();
    }
  }, [isCategoryBarOpen, closeCategoryBar, openCategoryBar]);

  if (!effectiveUser || loading) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isSuiviActive = pathname === '/historique' || pathname.startsWith('/historique');

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t border-gray-100 md:hidden rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        style={{ touchAction: 'manipulation', overscrollBehavior: 'none' }}
        aria-label="Navigation principale"
      >
        <div className="flex items-stretch justify-between px-4 pt-1.5 gap-2">
          <TouchLink
            href={preserveDate('/')}
            aria-label="Accueil"
            aria-current={isHomeActive ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-colors',
              isHomeActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
            )}
          >
            <span
              className={clsx('text-xl', isHomeActive ? 'text-gray-900 scale-110' : 'text-gray-600')}
              role="img"
              aria-hidden="true"
            >
              {NAVIGATION_EMOJIS.HOME}
            </span>
            <span
              className={clsx(
                'mt-0.5 text-xs',
                isHomeActive ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'
              )}
            >
              Accueil
            </span>
          </TouchLink>

          <button
            type="button"
            onClick={handleClick}
            onPointerDown={isCategoryBarOpen ? handlePointerDownWhenOpen : undefined}
            aria-label={isCategoryBarOpen ? 'Fermer le menu des catégories' : 'Ouvrir le menu des catégories'}
            aria-expanded={isCategoryBarOpen}
            aria-haspopup="true"
            style={{ touchAction: 'manipulation' }}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
              isCategoryBarOpen ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
            )}
          >
            <span
              className={clsx(
                'flex items-center justify-center rounded-full w-9 h-9 border border-gray-200 bg-gray-50/80',
                isCategoryBarOpen && 'bg-gray-200 border-gray-300'
              )}
              aria-hidden
            >
              <ChevronIcon
                direction={isCategoryBarOpen ? 'down' : 'up'}
                className={clsx('w-4 h-4 text-gray-600', isCategoryBarOpen && 'text-gray-800')}
                aria-hidden
              />
            </span>
            <span
              className={clsx(
                'mt-0.5 text-xs',
                isCategoryBarOpen ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'
              )}
            >
              {isCategoryBarOpen ? 'Fermer' : 'Voir les catégories'}
            </span>
          </button>

          <TouchLink
            href={preserveDate('/historique')}
            aria-label="Suivi"
            aria-current={isSuiviActive ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-colors',
              isSuiviActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
            )}
          >
            <span
              className={clsx('text-xl', isSuiviActive ? 'text-gray-900 scale-110' : 'text-gray-600')}
              role="img"
              aria-hidden="true"
            >
              {SUIVI_EMOJI}
            </span>
            <span
              className={clsx(
                'mt-0.5 text-xs',
                isSuiviActive ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'
              )}
            >
              Suivi
            </span>
          </TouchLink>
        </div>
      </nav>

      <ExercisesCategoryBar isOpen={isCategoryBarOpen} onClose={closeCategoryBar} />
    </>
  );
});
