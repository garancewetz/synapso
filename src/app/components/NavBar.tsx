'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { ErrorMessage, MenuLink, Loader, Logo, Input, Button } from '@/app/components';
import { MenuIcon, CloseIcon, PlusIcon, BookIcon, ClockIcon, SettingsIcon, CheckIcon } from '@/app/components/ui/icons';
import { useBodyScrollLock } from '@/app/hooks/useBodyScrollLock';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { cn } from '@/app/utils/cn';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const { currentUser, setCurrentUser, users, changingUser, refreshUsers } = useUser();
  const pathname = usePathname();
  const { isLeftHanded, getMenuPositionClasses } = useHandPreference();

  const handleUserChange = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserName.trim()) {
      setCreateUserError('Le nom est obligatoire');
      return;
    }

    setCreatingUser(true);
    setCreateUserError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newUserName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const newUser = await response.json();
      
      // Recharger la liste des utilisateurs
      await refreshUsers();
      
      // Définir le nouvel utilisateur comme utilisateur actuel
      setCurrentUser(newUser);
      
      // Réinitialiser le formulaire
      setNewUserName('');
      setShowCreateUser(false);
      setCreateUserError('');
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      setCreateUserError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setCreatingUser(false);
    }
  };

  // Bloquer le scroll du body quand le menu est ouvert
  useBodyScrollLock(isMenuOpen);

  return (
    <>
      {/* Header minimaliste */}
      <header className="bg-white max-w-9xl w-full mx-auto rounded-md mb-4 md:mb-6 px-4 md:px-6">
        <div className={cn('flex items-center py-3 md:py-4 justify-between', isLeftHanded && 'flex-row-reverse')}>
          {/* Logo et nom */}
          <Link 
            href="/" 
            className={cn('flex items-center gap-2 px-2 rounded-xl hover:bg-gray-50 transition-colors', !isLeftHanded && '-ml-2')}
            aria-label="Retour à l'accueil Synapso"
          >
            <Logo size={36} className="md:scale-110 " />
            <span className="text-lg font-semibold text-gray-800">Synapso</span>
          </Link>

          {/* Bouton menu - position adaptée à la préférence de main */}
          <button
            onClick={() => setIsMenuOpen(true)}
            disabled={changingUser}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
            aria-label="Ouvrir le menu"
            aria-expanded={isMenuOpen}
            aria-controls="main-menu"
          >
            {changingUser ? (
              <Loader size="small" />
            ) : (
              <MenuIcon className="w-6 h-6 flex items-center justify-center" />
            )}
          </button>
        </div>
      </header>

      {/* Overlay sombre */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu latéral (Drawer) - position adaptée à la préférence de main */}
      <div
        id="main-menu"
        className={cn(
          'fixed top-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col',
          'transform transition-transform duration-300 ease-out',
          getMenuPositionClasses(isMenuOpen)
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        {/* En-tête du drawer */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h2 id="menu-title" className="text-xl font-bold text-gray-900">Menu</h2>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
            aria-label="Fermer le menu"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu du menu */}
        <div className="p-5 flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
          {/* Section Profil */}
          <div className="mb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
              Profil
            </h3>
            <div className="bg-gray-50 rounded-xl p-2.5 space-y-2 max-h-60 overflow-y-auto border-2 border-gray-200">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserChange(user.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-200
                    min-h-[56px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
                    ${currentUser?.id === user.id
                      ? 'bg-white shadow-md text-gray-900 font-semibold border-2 border-emerald-200'
                      : 'text-gray-700 hover:bg-white/70 border-2 border-transparent hover:border-gray-200'
                    }
                  `}
                >
                  <span className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0
                    ${currentUser?.id === user.id
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-300 text-gray-700'
                    }
                  `}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex-1 text-left text-base font-medium">{user.name}</span>
                  {currentUser?.id === user.id && (
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
              
              {!showCreateUser ? (
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                             bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm
                             hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-[1.01]
                             active:scale-[0.99] border border-blue-400 shadow-sm"
                >
                  <PlusIcon className="w-4 h-4 text-white" />
                  <span>Nouvel utilisateur</span>
                </button>
              ) : (
                <form onSubmit={handleCreateUser} className="bg-white rounded-lg p-3 space-y-3 border border-gray-200">
                  <ErrorMessage message={createUserError} />
                  <Input
                    label="Nom"
                    type="text"
                    required
                    placeholder="Ex: Calypso"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    disabled={creatingUser}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={creatingUser || !newUserName.trim()}
                      className="flex-1 text-sm py-2"
                    >
                      {creatingUser ? (
                        <>
                          <Loader size="small" />
                          <span>Création...</span>
                        </>
                      ) : (
                        'Créer'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowCreateUser(false);
                        setNewUserName('');
                        setCreateUserError('');
                      }}
                      className="text-sm py-2"
                      disabled={creatingUser}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Liens de navigation */}
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
            Actions
          </h3>

          {/* Ajouter un exercice */}
          <MenuLink
            href={`/exercice/add?from=${encodeURIComponent(pathname)}`}
            onClick={() => setIsMenuOpen(false)}
            icon={<PlusIcon />}
            title="Ajouter un exercice"
            iconBgColor="bg-gradient-to-br from-emerald-400 to-emerald-600"
            iconTextColor="text-white"
          />

          {/* Historique */}
          <MenuLink
            href="/historique"
            onClick={() => setIsMenuOpen(false)}
            icon={<ClockIcon className="w-5 h-5" />}
            title="Historique"
            iconBgColor="bg-gradient-to-br from-amber-400 to-amber-600"
            iconTextColor="text-white"
          />

          {/* Journal d'aphasie - seulement pour Calypso */}
          {currentUser?.name === 'Calypso' && (
            <MenuLink
              href="/aphasie"
              onClick={() => setIsMenuOpen(false)}
              icon={<BookIcon />}
              title="Journal d'aphasie"
              iconBgColor="bg-gradient-to-br from-purple-400 to-purple-600"
              iconTextColor="text-white"
            />
          )}

          {/* Paramètres utilisateur */}
          <MenuLink
            href="/settings"
            onClick={() => setIsMenuOpen(false)}
            icon={<SettingsIcon />}
            title="Paramètres"
            iconBgColor="bg-gradient-to-br from-blue-400 to-blue-600"
            iconTextColor="text-white"
          />
        </div>
        </div>
    </>
  );
}
