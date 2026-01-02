'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/app/contexts/UserContext';
import { Logo, Loader } from '@/app/components';
import { MenuIcon } from '@/app/components/ui/icons';
import { NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { useMenuState } from '@/app/hooks/useMenuState';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import clsx from 'clsx';
import { MenuDrawer } from './MenuDrawer';

/**
 * Composant NavBar - Barre de navigation principale avec menu latéral
 * 
 * Fonctionnalités :
 * - Menu latéral avec trap focus pour l'accessibilité
 * - Gestion des utilisateurs
 * - Navigation vers les différentes sections
 * - Support de la préférence de main (gauche/droite)
 */
export default function NavBar() {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { currentUser, setCurrentUser, users, changingUser, refreshUsers } = useUser();
  const { isOpen, openMenu, closeMenu } = useMenuState();
  const { isLeftHanded } = useHandPreference();

  // Bloquer le scroll du body quand le menu est ouvert
  useBodyScrollLock(isOpen);

  /**
   * Gère le changement d'utilisateur
   */
  const handleUserChange = useCallback(
    (userId: number) => {
      const selectedUser = users.find((u) => u.id === userId);
      if (selectedUser) {
        setCurrentUser(selectedUser);
      }
    },
    [users, setCurrentUser]
  );

  /**
   * Gère la création d'un nouvel utilisateur
   */
  const handleCreateUser = useCallback(
    async (name: string) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const newUser = await response.json();
      await refreshUsers();
      setCurrentUser(newUser);
    },
    [refreshUsers, setCurrentUser]
  );

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
          <Link
            href="/"
            className={clsx(
              'flex items-center gap-2 px-2 rounded-xl hover:bg-gray-50 transition-colors',
              !isLeftHanded && '-ml-2'
            )}
            aria-label="Retour à l'accueil Synapso"
          >
            <Logo size={36} className="md:scale-110" />
            <span className="text-lg font-semibold text-gray-800">Synapso</span>
          </Link>

          {/* Nom utilisateur et bouton menu */}
          <div className={clsx(
            'flex items-center gap-3',
            isLeftHanded && 'flex-row-reverse'
          )}>
            {currentUser && (
              <Link
                href="/"
                className="text-sm font-medium text-gray-600 px-2 hover:text-gray-800 transition-colors cursor-pointer flex items-center gap-1.5"
                aria-label="Retour à l'accueil"
              >
                <span className="text-base">{NAVIGATION_EMOJIS.HOME}</span>
                {currentUser.name}
              </Link>
            )}
            <button
              ref={menuButtonRef}
              onClick={openMenu}
              disabled={changingUser}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
              aria-label="Ouvrir le menu"
              aria-expanded={isOpen}
              aria-controls="main-menu"
            >
              {changingUser ? (
                <Loader size="small" />
              ) : (
                <MenuIcon className="w-6 h-6 flex items-center justify-center" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu latéral avec trap focus */}
      <MenuDrawer
        isOpen={isOpen}
        onClose={closeMenu}
        users={users}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onCreateUser={handleCreateUser}
        menuButtonRef={menuButtonRef}
      />
    </>
  );
}

