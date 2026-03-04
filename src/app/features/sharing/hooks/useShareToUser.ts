'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/app/contexts/ToastContext';
import { queryKeys } from '@/app/lib/api-queries';

type UseShareToUserReturn = {
  shareToUser: (exerciceId: number, receiverId: number) => Promise<boolean>;
  shareToMultiple: (exerciceId: number, receiverIds: number[]) => Promise<number>;
  isSharing: boolean;
};

export function useShareToUser(): UseShareToUserReturn {
  const [isSharing, setIsSharing] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const shareToUser = useCallback(async (exerciceId: number, receiverId: number): Promise<boolean> => {
    setIsSharing(true);
    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ exerciceId, receiverId }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Erreur lors du partage');
        return false;
      }

      const share = await res.json();
      showToast(`Exercice envoyé à ${share.receiver?.name || "l'utilisateur"}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.count() });
      return true;
    } catch {
      showToast('Erreur lors du partage');
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [showToast, queryClient]);

  const shareToMultiple = useCallback(
    async (exerciceId: number, receiverIds: number[]): Promise<number> => {
      if (receiverIds.length === 0) return 0;
      setIsSharing(true);
      let successCount = 0;
      try {
        for (const receiverId of receiverIds) {
          const res = await fetch('/api/shares', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ exerciceId, receiverId }),
          });
          if (res.ok) successCount++;
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.shares.count() });
        const failed = receiverIds.length - successCount;
        if (failed === 0) {
          showToast(
            successCount === 1
              ? 'Exercice envoyé à 1 personne'
              : `Exercice envoyé à ${successCount} personnes`
          );
        } else {
          showToast(
            successCount > 0
              ? `Envoyé à ${successCount} personne(s), échec pour ${failed}`
              : 'Erreur lors du partage'
          );
        }
        return successCount;
      } catch {
        showToast('Erreur lors du partage');
        return 0;
      } finally {
        setIsSharing(false);
      }
    },
    [showToast, queryClient]
  );

  return { shareToUser, shareToMultiple, isSharing };
}
