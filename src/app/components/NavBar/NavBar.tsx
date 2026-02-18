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
import { usePreserveDateParam } from '@/app/features/time-machine';
import { useSelectedDate } from '@/app/contexts/SelectedDateContext';
import { isToday } from 'date-fns';
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
  const preserveDate = usePreserveDateParam();
  const { selectedDate, isDateSelected } = useSelectedDate();

  // Bloquer le scroll du body quand le menu est ouvert
  useBodyScrollLock(isOpen);

  // ⚡ MODE SABLIER: Ajouter un padding-top si la bannière est visible
  const isBannerVisible = isDateSelected && selectedDate && !isToday(selectedDate);

  const categories = CATEGORY_ORDER;
  const isHomeActive = pathname === '/';
  const isHistoriqueActive = pathname === '/historique';
  const isJournalActive = pathname === '/journal' || pathname.startsWith('/journal/');
  const hasJournal = effectiveUser?.hasJournal ?? false;

  return (
    <>
      {/* Header minimaliste */}
      <header className={clsx(
        'bg-white/95 backdrop-blur-sm max-w-[90rem] w-full mx-auto rounded-md mb-4 md:mb-4 px-4 md:px-6',
        'md:sticky md:top-0 md:z-50 md:border-b md:border-gray-100',
        'transition-all duration-300',
        // ⚡ MODE SABLIER: Ajouter un padding-top pour laisser de la place à la bannière fixe
        // La bannière fait environ 70-80px de hauteur (py-2.5 + 2 lignes de texte + border)
        // On utilise pt-24 (96px) pour avoir une marge de sécurité
        isBannerVisible && 'pt-20 sm:pt-24'
      )}>
        <div
          className={clsx(
            'flex items-center py-3 md:py-2.5 justify-between',
            isLeftHanded && 'flex-row-reverse'
          )}
        >
          {/* Logo et nom */}
          <div className={clsx(
            'flex items-center gap-3 shrink-0',
            isLeftHanded && 'flex-row-reverse'
          )}>
            <TouchLink
              href={preserveDate('/')}
              className={clsx(
                'flex items-center gap-2 px-2 rounded-xl hover:bg-gray-50 transition-colors shrink-0 cursor-pointer',
                !isLeftHanded && '-ml-2'
              )}
              aria-label="Retour à l'accueil Synapso"
            >
              <Logo size={36} />
              <span className="hidden md:inline text-base text-gray-800 font-medium">Synapso</span>
              <span className="text-xl" aria-hidden="true">🏠</span>
            </TouchLink>
          </div>

          {/* Navigation desktop - Masquée sur mobile */}
          <nav 
            className="hidden md:flex items-center gap-0.5 flex-1 justify-center px-2"
            aria-label="Navigation principale"
          >
            {/* Lien Accueil */}
            <TouchLink
              href={preserveDate('/')}
              className={clsx(
                'relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                'hover:text-gray-900 hover:bg-gray-50',
                isHomeActive
                  ? 'text-gray-900'
                  : 'text-gray-600'
              )}
              aria-label="Accueil"
              aria-current={isHomeActive ? 'page' : undefined}
            >
              Accueil
              {isHomeActive && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-gray-900 rounded-full" />
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
                  href={preserveDate(href)}
                  className={clsx(
                    'relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                    'hover:bg-gray-50',
                    isActive ? colors.text : 'text-gray-600 hover:text-gray-900'
                  )}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                  {isActive && (
                    <span 
                      className={clsx(
                        'absolute bottom-0 left-1 right-1 h-0.5 rounded-full',
                        colors.accent
                      )} 
                    />
                  )}
                </TouchLink>
              );
            })}

            {/* Ma progression */}
            <TouchLink
              href={preserveDate('/historique')}
              className={clsx(
                'relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                'hover:bg-gray-50',
                isHistoriqueActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
              aria-label="Ma progression"
              aria-current={isHistoriqueActive ? 'page' : undefined}
            >
              Ma progression
              {isHistoriqueActive && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-gray-900 rounded-full" />
              )}
            </TouchLink>

            {/* Journal (si activé pour l'utilisateur) */}
            {hasJournal && (
              <TouchLink
                href={preserveDate('/journal')}
                className={clsx(
                  'relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md',
                  'hover:bg-gray-50',
                  isJournalActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                )}
                aria-label="Journal"
                aria-current={isJournalActive ? 'page' : undefined}
              >
                Journal
                {isJournalActive && (
                  <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-gray-900 rounded-full" />
                )}
              </TouchLink>
            )}
          </nav>

          {/* Badge utilisateur et bouton menu */}
          <div className={clsx(
            'flex items-center gap-2 shrink-0',
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
