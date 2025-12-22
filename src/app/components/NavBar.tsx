'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/app/contexts/UserContext';
import Loader from '@/app/components/Loader';
import Logo from '@/app/components/Logo';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';
import ErrorMessage from '@/app/components/ErrorMessage';
import MenuLink from '@/app/components/MenuLink';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const { currentUser, setCurrentUser, users, changingUser, refreshUsers } = useUser();

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
          <Link href="/" className="flex items-center gap-2">
            <Logo size={24} className="md:scale-110" />
            <span className="text-base md:text-lg font-semibold text-gray-900">Synapso</span>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
                    <svg className="w-4 h-4 ml-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
              
              {!showCreateUser ? (
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-blue-600 hover:bg-blue-50 border border-blue-200"
                >
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
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
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateUser(false);
                        setNewUserName('');
                        setCreateUserError('');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      disabled={creatingUser}
                    >
                      Annuler
                    </button>
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
            href="/exercice/add"
            onClick={() => setIsMenuOpen(false)}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
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
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
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
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Historique"
            description="Voir les séances passées"
            iconBgColor="bg-blue-100"
            iconTextColor="text-blue-600"
          />

          {/* Paramètres utilisateur */}
          <MenuLink
            href="/settings"
            onClick={() => setIsMenuOpen(false)}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
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
