'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { ErrorMessage, MenuLink, Loader, Logo, Input, Button } from '@/app/components';
import { MenuIcon, CloseIcon, PlusIcon, BookIcon, ClockIcon, SettingsIcon, CheckIcon } from '@/app/components/ui/icons';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const { currentUser, setCurrentUser, users, changingUser, refreshUsers } = useUser();
  const pathname = usePathname();

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

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Header minimaliste */}
      <header className="bg-white max-w-9xl w-full mx-auto rounded-md mb-4 md:mb-6 px-4 md:px-6">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo et nom à gauche */}
          <Link 
            href="/" 
            className="flex items-center gap-2 -ml-2 px-2 rounded-xl hover:bg-gray-50 transition-colors"
            aria-label="Retour à l'accueil Synapso"
          >
            <Logo size={36} className="md:scale-110 " />
            <span className="text-lg font-semibold text-gray-900">Synapso</span>
          </Link>

          {/* Bouton menu à droite */}
          <button
            onClick={() => setIsMenuOpen(true)}
            disabled={changingUser}
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Ouvrir le menu"
          >
            {changingUser ? (
              <Loader size="small" />
            ) : (
              <MenuIcon className="w-6 h-6" />
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

      {/* Menu latéral (Drawer) */}
      <div
        className={`
          fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl
          transform transition-transform duration-300 ease-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* En-tête du drawer */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu du menu */}
        <div className="p-4 flex flex-col gap-2">
          {/* Section Profil */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Profil
            </h3>
            <div className="bg-gray-50 rounded-xl p-2 space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserChange(user.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${currentUser?.id === user.id
                      ? 'bg-white shadow-sm text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-white/50'
                    }
                  `}
                >
                  <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>
                  {currentUser?.id === user.id && (
                    <CheckIcon className="w-4 h-4 ml-auto text-emerald-500" />
                  )}
                </button>
              ))}
              
              {!showCreateUser ? (
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-blue-600 hover:bg-blue-50 border border-blue-200"
                >
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    <PlusIcon className="w-4 h-4 text-blue-600" />
                  </span>
                  <span className="font-medium">Créer un utilisateur</span>
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
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Actions
          </h3>

          {/* Ajouter un exercice */}
          <MenuLink
            href={`/exercice/add?from=${encodeURIComponent(pathname)}`}
            onClick={() => setIsMenuOpen(false)}
            icon={<PlusIcon />}
            title="Ajouter un exercice"
            description="Créer un nouvel exercice"
            iconBgColor="bg-emerald-100"
            iconTextColor="text-emerald-600"
          />

     
          {/* Journal d'aphasie - seulement pour Calypso */}
          {currentUser?.name === 'Calypso' && (
            <MenuLink
              href="/aphasie"
              onClick={() => setIsMenuOpen(false)}
              icon={<BookIcon />}
              title="Journal d'aphasie"
              description="Notes et observations"
              iconBgColor="bg-purple-100"
              iconTextColor="text-purple-600"
            />
          )}

          {/* Historique */}
          <MenuLink
            href="/historique"
            onClick={() => setIsMenuOpen(false)}
            icon={<ClockIcon className="w-5 h-5" />}
            title="Historique"
            description="Voir les séances passées"
            iconBgColor="bg-blue-100"
            iconTextColor="text-blue-600"
          />

          {/* Paramètres utilisateur */}
          <MenuLink
            href="/settings"
            onClick={() => setIsMenuOpen(false)}
            icon={<SettingsIcon />}
            title="Settings user"
            description="Paramètres utilisateur"
            iconBgColor="bg-gray-100"
            iconTextColor="text-gray-600"
          />
        </div>
      </div>
    </>
  );
}
