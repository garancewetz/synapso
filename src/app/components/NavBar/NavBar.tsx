'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { Logo, Loader } from '@/app/components';
import { UserBadge } from '@/app/components/UserBadge';
import { MenuIcon } from '@/app/components/ui/icons';
import { Button } from '@/app/components/ui/Button';
import { useMenuState } from '@/app/hooks/useMenuState';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import clsx from 'clsx';
import { MenuDrawer } from './MenuDrawer';
import { TouchLink } from '@/app/components/TouchLink';
import { 
  CATEGORY_ORDER, 
  CATEGORY_HREFS,
  CATEGORY_LABELS,
  CATEGORY_COLORS
} from '@/app/constants/exercice.constants';

/**
 * Composant NavBar - Barre de navigation principale avec menu latéral
 * 
 * Fonctionnalités :
 * - Navigation horizontale sur desktop (Accueil + catégories)
 * - Menu latéral avec trap focus pour l'accessibilité
 * - Affichage de l'utilisateur actuel
 * - Support de la préférence de main (gauche/droite)
 */
export function NavBar() {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { effectiveUser, loading } = useUser();
  const { isOpen, openMenu, closeMenu } = useMenuState();
  const { isLeftHanded } = useHandPreference();

  // Bloquer le scroll du body quand le menu est ouvert
  useBodyScrollLock(isOpen);

  const categories = CATEGORY_ORDER;
  const isHomeActive = pathname === '/';

  return (
    <>
      {/* Header minimaliste */}
      <header className="bg-white max-w-9xl w-full mx-auto rounded-md mb-4 md:mb-6 px-4 md:px-6">
        <div
          className={clsx(
            'flex items-center py-3 md:py-4 justify-between',
            isLeftHanded && 'flex-row-reverse'
          )}
        >
          {/* Logo et nom */}
          <div className={clsx(
            'flex items-center gap-3 flex-shrink-0',
            isLeftHanded && 'flex-row-reverse'
          )}>
            <TouchLink
              href="/"
              className={clsx(
                'flex items-center gap-2 px-2 rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0 cursor-pointer',
                !isLeftHanded && '-ml-2'
              )}
              aria-label="Retour à l'accueil Synapso"
            >
              <Logo size={36} className="md:scale-110" />
              <span className="text-lg text-gray-800 max-lg:hidden">Synapso</span>
              <span className="text-xl" aria-hidden="true">🏠</span>
            </TouchLink>
          </div>

          {/* Navigation desktop - Masquée sur mobile */}
          <nav 
            className="hidden md:flex items-center gap-1 flex-1 justify-center px-4"
            aria-label="Navigation principale"
          >
            {/* Lien Accueil */}
            <TouchLink
              href="/"
              className={clsx(
                'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                'hover:text-gray-900',
                isHomeActive
                  ? 'text-gray-900'
                  : 'text-gray-600'
              )}
              aria-label="Accueil"
              aria-current={isHomeActive ? 'page' : undefined}
            >
              Accueil
              {isHomeActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
              )}
            </TouchLink>

            {/* Catégories */}
            {categories.map((category) => {
              const colors = CATEGORY_COLORS[category];
              const label = CATEGORY_LABELS[category];
              const href = CATEGORY_HREFS[category];
              const isActive = pathname === href;

              return (
                <TouchLink
                  key={category}
                  href={href}
                  className={clsx(
                    'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                    isActive ? colors.text : 'text-gray-600 hover:text-gray-900'
                  )}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                  {isActive && (
                    <span 
                      className={clsx(
                        'absolute bottom-0 left-0 right-0 h-0.5 rounded-full',
                        colors.accent
                      )} 
                    />
                  )}
                </TouchLink>
              );
            })}
          </nav>

          {/* Badge utilisateur et bouton menu */}
          <div className={clsx(
            'flex items-center gap-2 flex-shrink-0',
            isLeftHanded && 'flex-row-reverse'
          )}>
            {effectiveUser && (
              <UserBadge size="sm" />
            )}
            <Button
              iconOnly
              ref={menuButtonRef}
              onClick={openMenu}
              disabled={loading}
              className="!p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Ouvrir le menu"
              aria-expanded={isOpen}
              aria-controls="main-menu"
            >
              {loading ? (
                <Loader size="small" />
              ) : (
                <MenuIcon className="w-6 h-6 flex items-center justify-center" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Menu latéral avec trap focus */}
      <MenuDrawer
        isOpen={isOpen}
        onClose={closeMenu}
        effectiveUser={effectiveUser}
        menuButtonRef={menuButtonRef}
      />
    </>
  );
}
