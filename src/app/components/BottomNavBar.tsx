'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { 
  CATEGORY_ORDER, 
  CATEGORY_LABELS_SHORT,
  CATEGORY_ICONS,
  CATEGORY_MOBILE_STYLES,
  CATEGORY_HREFS
} from '@/app/constants/exercice.constants';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { TouchLink } from '@/app/components/TouchLink';

export function BottomNavBar() {
  const pathname = usePathname();
  
  const categories = CATEGORY_ORDER;
  const isHomeActive = pathname === '/';

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 pb-safe md:hidden shadow-lg"
      aria-label="Navigation principale"
    >
      <div className="px-1 py-2">
        <div className="grid grid-cols-5 gap-1">
          {/* Icône maison pour la page d'accueil */}
          <TouchLink
            href="/"
            aria-label="Accueil"
            className="flex flex-col items-center justify-center gap-1.5 py-2 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              'transition-all duration-200',
              isHomeActive
                ? 'bg-linear-to-br from-gray-300 to-gray-400 shadow-lg ring-3 ring-gray-400 scale-110 border-2 border-gray-400'
                : 'bg-linear-to-br from-gray-100 to-gray-200 shadow-sm'
            )}>
              <span className={clsx(
                'text-2xl transition-transform duration-200',
                isHomeActive ? 'text-gray-900 scale-110' : 'text-gray-600'
              )} role="img" aria-hidden="true">
                {NAVIGATION_EMOJIS.HOME}
              </span>
            </div>
            <span className={clsx(
              'text-xs transition-all',
              isHomeActive ? 'text-gray-900 font-bold scale-105' : 'text-gray-500 font-medium'
            )}>
              Accueil
            </span>
          </TouchLink>

          {/* Catégories */}
          {categories.map((category) => {
            const styles = CATEGORY_MOBILE_STYLES[category];
            const icon = CATEGORY_ICONS[category];
            const label = CATEGORY_LABELS_SHORT[category];
            const href = CATEGORY_HREFS[category];
            const isActive = pathname === href;
            
            // Dégradés plus marqués pour l'état actif
            const activeGradients = {
              UPPER_BODY: 'bg-linear-to-br from-orange-200 to-orange-300',
              CORE: 'bg-linear-to-br from-teal-200 to-teal-300',
              LOWER_BODY: 'bg-linear-to-br from-blue-200 to-blue-300',
              STRETCHING: 'bg-linear-to-br from-purple-200 to-purple-300',
            };

            return (
              <TouchLink
                key={category}
                href={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1.5 py-2 cursor-pointer rounded-lg transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                  'transition-all duration-200',
                  isActive ? activeGradients[category] : styles.iconBg,
                  isActive
                    ? `shadow-lg ring-3 ${styles.ring} scale-110`
                    : 'shadow-sm'
                )}>
                  <span className={clsx(
                    'text-2xl transition-transform duration-200',
                    styles.iconText,
                    isActive && 'scale-110 font-bold'
                  )} role="img" aria-hidden="true">
                    {icon}
                  </span>
                </div>
                <span className={clsx(
                  'text-xs transition-all text-center leading-tight',
                  isActive ? 'text-gray-900 font-bold scale-105' : 'text-gray-500 font-medium'
                )}>
                  {label}
                </span>
              </TouchLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
