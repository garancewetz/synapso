'use client';

import { useCallback } from 'react';
import { BottomSheetModal } from '@/app/components/ui/BottomSheetModal';
import { Loader } from '@/app/components/ui/Loader';
import { useShareableUsers } from '../hooks/useShareableUsers';
import { useShareToUser } from '../hooks/useShareToUser';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  exerciceId: number;
};

export function ShareToUserModal({ isOpen, onClose, exerciceId }: Props) {
  const { users, isLoading } = useShareableUsers();
  const { shareToUser, isSharing } = useShareToUser();

  const handleSelectUser = useCallback(async (receiverId: number) => {
    const success = await shareToUser(exerciceId, receiverId);
    if (success) {
      onClose();
    }
  }, [shareToUser, exerciceId, onClose]);

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Partager avec
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="small" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun utilisateur disponible
          </p>
        ) : (
          <div className="space-y-1 overflow-y-auto max-h-[50vh]">
            {users.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectUser(user.id)}
                disabled={isSharing}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-900 font-medium">{user.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheetModal>
  );
}
