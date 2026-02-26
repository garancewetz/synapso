'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/app/contexts/ToastContext';
import { queryKeys } from '@/app/lib/api-queries';

type UseShareToUserReturn = {
  shareToUser: (exerciceId: number, receiverId: number) => Promise<boolean>;
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

  return { shareToUser, isSharing };
}
