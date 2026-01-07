'use client';

import { useRef } from 'react';
import { Logo } from '@/app/components';
import { CloseIcon } from '@/app/components/ui/icons';
import { useFocusTrap } from '@/app/hooks/useFocusTrap';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import clsx from 'clsx';
import { UserSection } from './UserSection';
import { MenuActions } from './MenuActions';
import type { User } from '@/app/types';
import type { RefObject } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onUserChange: (userId: number) => void;
  onCreateUser: (name: string) => Promise<void>;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export function MenuDrawer({
  isOpen,
  onClose,
  users,
  currentUser,
  onUserChange,
  onCreateUser,
  menuButtonRef,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { getMenuPositionClasses } = useHandPreference();

  // Trap focus dans le menu avec gestion de la touche Escape
  useFocusTrap(menuRef, isOpen, {
    initialFocus: 'first',
    restoreFocus: true,
    restoreFocusRef: menuButtonRef,
    onEscape: onClose,
  });

  const tabIndex = isOpen ? 0 : -1;

  return (
    <>
      {/* Overlay sombre */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
          onTouchStart={(e) => {
            // Empêcher le double-tap zoom sur l'overlay
            e.preventDefault();
            onClose();
          }}
          aria-hidden="true"
          role="presentation"
          style={{ touchAction: 'manipulation' }}
        />
      )}

      {/* Menu latéral (Drawer) */}
      <div
        ref={menuRef}
        id="main-menu"
        data-menu="true"
        className={clsx(
          'fixed top-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col',
          'transform transition-transform duration-300 ease-out',
          getMenuPositionClasses(isOpen)
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
        aria-hidden={!isOpen}
      >
        {/* En-tête du drawer */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h2 id="menu-title" className="text-xl font-bold text-gray-900">
              Menu
            </h2>
          </div>
          <button
            onClick={onClose}
            tabIndex={tabIndex}
            data-menu-item="true"
            className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            aria-label="Fermer le menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu du menu */}
        <div className="p-5 pb-24 md:pb-5 flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
          {/* Carte du user sélectionné avec dropdown de changement */}
          <UserSection
            users={users}
            currentUser={currentUser}
            onUserChange={onUserChange}
            onCreateUser={onCreateUser}
            isMenuOpen={isOpen}
          />

          {/* Activités principales */}
          <MenuActions currentUser={currentUser} onMenuClose={onClose} isMenuOpen={isOpen} />
        </div>
      </div>
    </>
  );
}

