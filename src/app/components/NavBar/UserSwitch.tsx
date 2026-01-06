'use client';

import { useState } from 'react';
import { ErrorMessage, Loader, Input, Button } from '@/app/components';
import { PlusIcon, CheckIcon } from '@/app/components/ui/icons';
import { useSlidingIndicator } from '@/app/hooks/useSlidingIndicator';
import type { User } from '@/app/types';

type Props = {
  users: User[];
  currentUser: User | null;
  onUserChange: (userId: number) => void;
  onCreateUser: (name: string) => Promise<void>;
  isMenuOpen: boolean;
};

/**
 * Section pour changer d'utilisateur, affichée après les activités principales
 */
export function UserSwitch({
  users,
  currentUser,
  onUserChange,
  onCreateUser,
  isMenuOpen,
}: Props) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');

  const activeUserIndex = users.findIndex((user) => user.id === currentUser?.id);

  // Utiliser le hook pour l'animation de glissement vertical
  const { itemsRef: usersRef, indicatorStyle, isReady } = useSlidingIndicator(
    activeUserIndex,
    'vertical',
    [users]
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName.trim()) {
      setCreateUserError('Le nom est obligatoire');
      return;
    }

    setCreatingUser(true);
    setCreateUserError('');

    try {
      await onCreateUser(newUserName.trim());
      setNewUserName('');
      setShowCreateUser(false);
      setCreateUserError('');
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      setCreateUserError(
        err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur'
      );
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCancel = () => {
    setShowCreateUser(false);
    setNewUserName('');
    setCreateUserError('');
  };

  const tabIndex = isMenuOpen ? 0 : -1;

  return (
    <div className="mt-2">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
        Changer d&apos;utilisateur
      </h3>
      <div className="bg-gray-50 rounded-xl p-2.5 space-y-2 max-h-50 overflow-y-auto border-2 border-gray-200 relative">
        {/* Élément de fond qui glisse */}
        <span
          className="absolute left-2.5 right-2.5 -z-0 flex overflow-hidden rounded-lg transition-all duration-300 ease-out pointer-events-none"
          style={{
            ...indicatorStyle,
            opacity: isReady ? 1 : 0,
            transitionProperty: 'top, height, opacity'
          }}
        >
          <span className="h-full w-full rounded-lg bg-white shadow-md border-2 border-emerald-200" />
        </span>

        {users.map((user, index) => (
          <button
            key={user.id}
            ref={(el) => { usersRef.current[index] = el }}
            onClick={() => onUserChange(user.id)}
            tabIndex={tabIndex}
            className={`
              w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-colors duration-200
              min-h-[56px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 relative z-10
              ${
                currentUser?.id === user.id
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-700 hover:bg-white/40'
              }
            `}
          >
            <span
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0
                ${
                  currentUser?.id === user.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-300 text-gray-700'
                }
              `}
            >
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
            tabIndex={tabIndex}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                       bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm
                       hover:from-blue-600 hover:to-blue-700 hover:shadow-md hover:scale-[1.01]
                       active:scale-[0.99] border border-blue-400 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
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
              tabIndex={tabIndex}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={creatingUser || !newUserName.trim()}
                className="flex-1 text-sm py-2"
                tabIndex={tabIndex}
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
                onClick={handleCancel}
                className="text-sm py-2"
                disabled={creatingUser}
                tabIndex={tabIndex}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

