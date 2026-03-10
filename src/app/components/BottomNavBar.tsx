'use client';

import { memo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';
import { ChevronIcon } from '@/app/components/ui/icons';
import { useUser } from '@/app/contexts/UserContext';
import { useLayoutContext } from '@/app/contexts/LayoutContext';
import { ExercisesRadialMenu } from '@/app/components/ExercisesRadialMenu';

const SUIVI_EMOJI = '📈';

export const BottomNavBar = memo(function BottomNavBar() {
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { preserveDate, isRadialOpen, setRadialOpen } = useLayoutContext();

  const openRadial = useCallback(() => setRadialOpen(true), [setRadialOpen]);
  const closeRadial = useCallback(() => setRadialOpen(false), [setRadialOpen]);

  if (!effectiveUser || loading) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isSuiviActive = pathname === '/historique' || pathname.startsWith('/historique');

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t-2 border-gray-200 pb-safe md:hidden shadow-lg"
        aria-label="Navigation principale"
      >
        <div className="flex items-center justify-between px-5 gap-6">
          <TouchLink
            href={preserveDate('/')}
            aria-label="Accueil"
            aria-current={isHomeActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center min-h-[48px] gap-1.5 py-3 rounded-lg transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div
              className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                isHomeActive
                  ? 'bg-linear-to-br from-gray-300 to-gray-400 shadow-lg ring-3 ring-gray-400 scale-110 border-2 border-gray-400'
                  : 'bg-linear-to-br from-gray-100 to-gray-200 shadow-sm'
              )}
            >
              <span className={clsx('text-2xl', isHomeActive ? 'text-gray-900 scale-110' : 'text-gray-600')} role="img" aria-hidden="true">
                {NAVIGATION_EMOJIS.HOME}
              </span>
            </div>
            <span className={clsx('text-xs', isHomeActive ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium')}>
              Accueil
            </span>
          </TouchLink>

          <div className="relative z-80 flex flex-col items-center justify-center min-h-[48px] gap-1.5 py-3 -mt-2">
            <button
              type="button"
              onClick={isRadialOpen ? closeRadial : openRadial}
              aria-label={isRadialOpen ? 'Fermer le menu des catégories' : 'Ouvrir le menu des catégories d’exercices'}
              aria-expanded={isRadialOpen}
              aria-haspopup="true"
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
                'border-2 bg-white shadow-md',
                'hover:bg-gray-50 active:scale-95',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
                isRadialOpen
                  ? 'border-gray-300 bg-gray-50 shadow-lg'
                  : 'border-gray-200'
              )}
            >
              <ChevronIcon
                direction={isRadialOpen ? 'down' : 'up'}
                className={clsx(
                  'w-8 h-8 transition-transform duration-200',
                  isRadialOpen ? 'text-gray-800' : 'text-gray-600'
                )}
                aria-hidden
              />
            </button>
            <span className={clsx('text-xs', isRadialOpen ? 'text-gray-700 font-semibold' : 'text-gray-500 font-medium')}>
              Exercices
            </span>
          </div>

          <TouchLink
            href={preserveDate('/historique')}
            aria-label="Suivi"
            aria-current={isSuiviActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center min-h-[48px] gap-1.5 py-3 rounded-lg transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div
              className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                isSuiviActive
                  ? 'bg-linear-to-br from-gray-300 to-gray-400 shadow-lg ring-3 ring-gray-400 scale-110 border-2 border-gray-400'
                  : 'bg-linear-to-br from-gray-100 to-gray-200 shadow-sm'
              )}
            >
              <span className={clsx('text-2xl', isSuiviActive ? 'text-gray-900 scale-110' : 'text-gray-600')} role="img" aria-hidden="true">
                {SUIVI_EMOJI}
              </span>
            </div>
            <span className={clsx('text-xs', isSuiviActive ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium')}>
              Suivi
            </span>
          </TouchLink>
        </div>
      </nav>

      <ExercisesRadialMenu isOpen={isRadialOpen} onClose={closeRadial} />
    </>
  );
});
