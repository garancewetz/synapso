'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import Loader from '@/app/components/atoms/Loader';
import Logo from '@/app/components/atoms/Logo';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, setCurrentUser, users, changingUser } = useUser();

  const handleUserChange = (userId: number) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
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
      <header className="bg-white max-w-9xl w-full mx-auto rounded-md mb-4 md:mb-6">
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
            <div className="bg-gray-50 rounded-xl p-2">
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
            </div>
          </div>

          {/* Liens de navigation */}
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Actions
          </h3>

          {/* Ajouter un exercice */}
          <Link
            href="/exercice/add"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <div>
              <span className="font-medium">Ajouter un exercice</span>
              <p className="text-xs text-gray-500">Créer un nouvel exercice</p>
            </div>
          </Link>

          {/* Journal d'aphasie - seulement pour Calypso */}
          {currentUser?.name === 'Calypso' && (
            <Link
              href="/aphasie"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <div>
                <span className="font-medium">Journal d&apos;aphasie</span>
                <p className="text-xs text-gray-500">Notes et observations</p>
              </div>
            </Link>
          )}

          {/* Historique */}
          <Link
            href="/historique"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <span className="font-medium">Historique</span>
              <p className="text-xs text-gray-500">Voir les séances passées</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
