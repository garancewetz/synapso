'use client';

import { useCallback, useState, useEffect } from 'react';
import clsx from 'clsx';
import { BottomSheetModal } from '@/app/components/ui/BottomSheetModal';
import { Loader } from '@/app/components/ui/Loader';
import { Button } from '@/app/components/ui/Button';
import { useShareableUsers } from '../hooks/useShareableUsers';
import { useShareToUser } from '../hooks/useShareToUser';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  exerciceId: number;
};

export function ShareToUserModal({ isOpen, onClose, exerciceId }: Props) {
  const { users, isLoading } = useShareableUsers();
  const { shareToMultiple, isSharing } = useShareToUser();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen) setSelectedIds(new Set());
  }, [isOpen]);

  const toggleUser = useCallback((userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const handleShare = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const count = await shareToMultiple(exerciceId, ids);
    if (count > 0) onClose();
  }, [shareToMultiple, exerciceId, selectedIds, onClose]);

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
          <>
            <div className="space-y-1 overflow-y-auto max-h-[50vh]">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selectedIds.has(user.id)}
                  aria-label={`Partager avec ${user.name}`}
                  onClick={() => toggleUser(user.id)}
                  disabled={isSharing}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  <div
                    className={clsx(
                      'w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center',
                      selectedIds.has(user.id) ? 'border-amber-500 bg-amber-500' : 'border-gray-300 bg-white'
                    )}
                    aria-hidden
                  >
                    {selectedIds.has(user.id) && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-900 font-medium">{user.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                onClick={handleShare}
                disabled={selectedIds.size === 0 || isSharing}
                className="w-full"
              >
                {isSharing
                  ? 'Envoi…'
                  : selectedIds.size === 0
                    ? 'Choisir au moins une personne'
                    : `Partager (${selectedIds.size})`}
              </Button>
            </div>
          </>
        )}
      </div>
    </BottomSheetModal>
  );
}
