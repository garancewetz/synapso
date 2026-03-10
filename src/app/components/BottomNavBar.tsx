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

  const openRadial = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setRadialOpen(true);
  }, [setRadialOpen]);
  const closeRadial = useCallback(() => setRadialOpen(false), [setRadialOpen]);

  if (!effectiveUser || loading) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isSuiviActive = pathname === '/historique' || pathname.startsWith('/historique');
  const isExerciceActive = pathname.startsWith('/exercices');

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t border-gray-200 pb-safe md:hidden shadow-lg"
        aria-label="Navigation principale"
      >
        <div className="flex items-stretch justify-between px-5 gap-4">
          <TouchLink
            href={preserveDate('/')}
            aria-label="Accueil"
            aria-current={isHomeActive ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center min-h-[56px] py-1.5 rounded-lg transition-colors',
              isHomeActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
            )}
          >
            <span
              className={clsx('text-2xl', isHomeActive ? 'text-gray-900 scale-110' : 'text-gray-600')}
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
            onClick={isRadialOpen ? closeRadial : openRadial}
            aria-label={isRadialOpen ? 'Fermer le menu des catégories' : 'Ouvrir le menu des catégories d’exercices'}
            aria-expanded={isRadialOpen}
            aria-haspopup="true"
            aria-current={isExerciceActive ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center min-h-[56px] py-1.5 rounded-lg transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
              isRadialOpen && 'bg-gray-100',
              !isRadialOpen && !isExerciceActive && 'hover:bg-gray-50 active:bg-gray-100',
              isExerciceActive && !isRadialOpen && 'bg-gray-100'
            )}
          >
            <ChevronIcon
              direction={isRadialOpen ? 'down' : 'up'}
              className={clsx(
                'w-8 h-8',
                isExerciceActive ? 'text-gray-900 scale-110' : isRadialOpen ? 'text-gray-800' : 'text-gray-600'
              )}
              aria-hidden
            />
            <span
              className={clsx(
                'mt-0.5 text-xs',
                isExerciceActive ? 'text-gray-900 font-semibold' : isRadialOpen ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'
              )}
            >
              {isRadialOpen ? 'Fermer' : 'Exercices'}
            </span>
          </button>

          <TouchLink
            href={preserveDate('/historique')}
            aria-label="Suivi"
            aria-current={isSuiviActive ? 'page' : undefined}
            className={clsx(
              'flex flex-1 flex-col items-center justify-center min-h-[56px] py-1.5 rounded-lg transition-colors',
              isSuiviActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
            )}
          >
            <span
              className={clsx('text-2xl', isSuiviActive ? 'text-gray-900 scale-110' : 'text-gray-600')}
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

      <ExercisesRadialMenu isOpen={isRadialOpen} onClose={closeRadial} />
    </>
  );
});
