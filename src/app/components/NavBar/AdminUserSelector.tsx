'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { UserDeleteButton } from '@/app/components/AdminUserSwitcher/UserDeleteButton';
import clsx from 'clsx';

type Props = {
  onMenuClose: () => void;
  isMenuOpen: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdminUserSelector({ onMenuClose: _onMenuClose, isMenuOpen }: Props) {
  const { 
    currentUser, 
    effectiveUser, 
    isAdmin, 
    allUsers, 
    impersonate, 
    stopImpersonation,
    refreshAllUsers,
    deleteUser,
  } = useUser();
  
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effacer l'erreur après 5 secondes
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recharger la liste des utilisateurs au montage
  useEffect(() => {
    if (isAdmin) {
      refreshAllUsers();
    }
  }, [isAdmin, refreshAllUsers]);

  // Ne rien afficher si pas admin
  if (!isAdmin || !currentUser) {
    return null;
  }

  const handleUserSelect = async (userId: number) => {
    if (userId === currentUser.id) {
      // Revenir à son propre compte
      await stopImpersonation();
    } else {
      // Impersonner cet utilisateur
      await impersonate(userId);
    }
    setIsOpen(false);
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    // Confirmation avant suppression
    const confirmed = window.confirm(
      `⚠️ Attention : Cette action est irréversible !\n\n` +
      `Vous êtes sur le point de supprimer le compte de "${userName}".\n\n` +
      `Toutes les données associées seront définitivement supprimées :\n` +
      `- Exercices\n` +
      `- Historique de progression\n` +
      `- Progrès et victoires\n` +
      `- Citations d'aphasie\n` +
      `- Exercices d'orthophonie\n\n` +
      `Êtes-vous absolument sûr de vouloir supprimer ce compte ?`
    );

    if (!confirmed) return;

    setDeletingUserId(userId);
    setDeleteError('');

    try {
      await deleteUser(userId);
      // La liste sera automatiquement rechargée par deleteUser
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingUserId(null);
    }
  };

  const tabIndex = isMenuOpen ? 0 : -1;

  return (
    <div ref={dropdownRef} className="relative">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-2">
        Administration
      </h3>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={tabIndex}
        className={clsx(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer',
          'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
        )}
        aria-label="Changer d'utilisateur"
        aria-expanded={isOpen}
      >
        <span className="text-lg">👑</span>
        <span className="font-medium text-sm flex-1 text-left">Voir comme...</span>
        <svg 
          className={clsx('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {allUsers.map((user) => {
              const isCurrentUser = user.id === currentUser.id;
              const isSelected = user.id === effectiveUser?.id;
              const isDeleting = deletingUserId === user.id;
              
              return (
                <div
                  key={user.id}
                  className={clsx(
                    'flex items-center gap-2',
                    isSelected && 'bg-amber-50'
                  )}
                >
                  <button
                    onClick={() => handleUserSelect(user.id)}
                    tabIndex={tabIndex}
                    className={clsx(
                      'flex-1 px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer',
                      isSelected 
                        ? 'bg-amber-50 border-l-4 border-amber-500' 
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    )}
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center text-lg',
                      user.role === 'ADMIN' ? 'bg-amber-100' : 'bg-gray-100'
                    )}>
                      {user.role === 'ADMIN' ? '👑' : '👤'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          'font-medium truncate',
                          isSelected ? 'text-amber-800' : 'text-gray-800'
                        )}>
                          {user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Vous
                          </span>
                        )}
                        {user.role === 'ADMIN' && (
                          <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      {user._count && (
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{user._count.exercices} exercices</span>
                          <span>{user._count.progress} progrès</span>
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Bouton de suppression (sauf pour soi-même) */}
                  {!isCurrentUser && (
                    <div className="pr-2 flex-shrink-0">
                      <UserDeleteButton
                        onDelete={() => handleDeleteUser(user.id, user.name)}
                        disabled={isDeleting}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Message d'erreur */}
          {deleteError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <p className="text-xs text-red-600">{deleteError}</p>
            </div>
          )}

          {/* Footer avec stats */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            {allUsers.length} utilisateur{allUsers.length > 1 ? 's' : ''} au total
          </div>
        </div>
      )}
    </div>
  );
}

