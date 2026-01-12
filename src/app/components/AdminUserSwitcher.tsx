'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { DeleteButton } from '@/app/components/ui/DeleteButton';
import clsx from 'clsx';

export function AdminUserSwitcher() {
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

  // Effacer l'erreur après 5 secondes
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const isImpersonating = effectiveUser && effectiveUser.id !== currentUser.id;

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

  return (
    <>
      {/* Bandeau d'impersonation (visible seulement quand on impersonne) */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">👁️</span>
              <span>
                Vue en tant que : <strong>{effectiveUser?.name}</strong>
              </span>
            </div>
            <button
              onClick={stopImpersonation}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Revenir à mon compte
            </button>
          </div>
        </div>
      )}

      {/* Sélecteur d'utilisateur (toujours visible pour admin) */}
      <div 
        ref={dropdownRef}
        className={clsx(
          'fixed z-40',
          isImpersonating ? 'top-14 left-1/2 -translate-x-1/2' : 'top-4 left-1/2 -translate-x-1/2'
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border-2 transition-all cursor-pointer',
            isImpersonating
              ? 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200'
              : 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
          )}
          aria-label="Changer d'utilisateur"
          aria-expanded={isOpen}
        >
          <span className="text-lg">👑</span>
          <span className="font-medium text-sm hidden sm:inline">Admin</span>
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
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-30">
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Voir comme...
              </p>
            </div>
            
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
                        <DeleteButton
                          onDelete={() => handleDeleteUser(user.id, user.name)}
                          label="🗑️"
                          confirmLabel="⚠️"
                          disabled={isDeleting}
                          className="!w-9 !h-9 !p-0 !text-xs !min-w-0"
                          resetDelay={3000}
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
    </>
  );
}

