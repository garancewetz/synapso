'use client';

import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { Logo, Loader } from '@/app/components';
import { UserBadge } from '@/app/components/UserBadge';
import { MenuIcon, PinIcon } from '@/app/components/ui/icons';
import { Button } from '@/app/components/ui/Button';
import { useMenuState } from '@/app/hooks/useMenuState';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { getCurrentPageName } from '@/app/utils/navigation.utils';
import { NAVIGATION_COLORS } from '@/app/constants/ui.constants';
import clsx from 'clsx';
import { MenuDrawer } from './MenuDrawer';
import { TouchLink } from '@/app/components/TouchLink';

/**
 * Composant NavBar - Barre de navigation principale avec menu latéral
 * 
 * Fonctionnalités :
 * - Menu latéral avec trap focus pour l'accessibilité
 * - Affichage de l'utilisateur actuel
 * - Navigation vers les différentes sections
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

  // Obtenir le nom de la page actuelle
  const currentPageName = getCurrentPageName(pathname);

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
            'flex items-center gap-3 flex-1 min-w-0',
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
              <span className="text-lg font-semibold text-gray-800">Synapso</span>
            </TouchLink>

            {/* Indicateur "Où suis-je ?" - Masqué sur mobile */}
            {currentPageName && (
              <div className={clsx(
                `hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${NAVIGATION_COLORS.indicator.bg} border ${NAVIGATION_COLORS.indicator.border} flex-shrink-0`,
                isLeftHanded && 'flex-row-reverse'
              )}>
                <PinIcon className={`w-4 h-4 ${NAVIGATION_COLORS.indicator.text} flex-shrink-0`} />
                <span className={`text-sm font-medium ${NAVIGATION_COLORS.indicator.textStrong} whitespace-nowrap`}>
                  {currentPageName}
                </span>
              </div>
            )}
          </div>

          {/* Badge utilisateur et bouton menu */}
          <div className={clsx(
            'flex items-center gap-2 flex-shrink-0',
            isLeftHanded && 'flex-row-reverse'
          )}>
            {effectiveUser && (
              <UserBadge showName size="md" />
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
