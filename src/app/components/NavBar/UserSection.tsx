'use client';

import { useState } from 'react';
import { CheckIcon, ChevronIcon, PlusIcon } from '@/app/components/ui/icons';
import { Dropdown } from '@/app/components/ui/Dropdown';
import { ErrorMessage, Loader, Input, Button } from '@/app/components';
import type { User } from '@/app/types';
import clsx from 'clsx';

type Props = {
  users: User[];
  currentUser: User | null;
  onUserChange: (userId: number) => void;
  onCreateUser: (name: string) => Promise<void>;
  isMenuOpen: boolean;
};

/**
 * Carte du user sélectionné avec dropdown intégré pour changer d'utilisateur
 */
export function UserSection({ users, currentUser, onUserChange, onCreateUser, isMenuOpen }: Props) {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');

  if (!currentUser) {
    return null;
  }

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

  const handleUserSelect = (userId: number) => {
    onUserChange(userId);
    setShowCreateUser(false);
  };

  const tabIndex = isMenuOpen ? 0 : -1;

  // Trigger du dropdown - la carte de l'utilisateur actuel
  const trigger = (
    <div className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 bg-gray-200 text-gray-700">
          {currentUser.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">Utilisateur actif</p>
        </div>
        <ChevronIcon className="w-4 h-4 text-gray-400 shrink-0" direction="down" />
      </div>
    </div>
  );

  return (
    <Dropdown trigger={trigger} isMenuOpen={isMenuOpen}>
      <div className="p-2 space-y-1">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            tabIndex={tabIndex}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
              'text-gray-700 hover:bg-gray-50',
              currentUser?.id === user.id && 'font-semibold'
            )}
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-gray-200 text-gray-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1 text-left text-sm">{user.name}</span>
            {currentUser?.id === user.id && (
              <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
          </button>
        ))}

        <div className="border-t border-gray-200 my-2" />

        {!showCreateUser ? (
          <button
            onClick={() => setShowCreateUser(true)}
            tabIndex={tabIndex}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all
                       bg-linear-to-r from-blue-500 to-blue-600 text-white font-medium text-sm
                       hover:from-blue-600 hover:to-blue-700 hover:shadow-md
                       active:scale-[0.98] border border-blue-400
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            <span>Nouvel utilisateur</span>
          </button>
        ) : (
          <form onSubmit={handleCreateUser} className="bg-gray-50 rounded-lg p-3 space-y-3">
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
    </Dropdown>
  );
}

