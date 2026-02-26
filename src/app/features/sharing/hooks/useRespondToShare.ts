'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/app/contexts/ToastContext';
import { queryKeys } from '@/app/lib/api-queries';

export function useRespondToShare() {
  const [isResponding, setIsResponding] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const respond = useCallback(async (shareId: number, action: 'ACCEPTED' | 'REJECTED'): Promise<boolean> => {
    setIsResponding(true);
    try {
      const res = await fetch(`/api/shares/${shareId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Erreur');
        return false;
      }

      if (action === 'ACCEPTED') {
        showToast('Exercice ajouté à votre collection !');
        // Invalider le cache exercices pour afficher le nouvel exercice
        queryClient.invalidateQueries({ queryKey: queryKeys.exercices.all });
      } else {
        showToast('Partage refusé');
      }

      // Invalider les caches shares
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.received() });
      queryClient.invalidateQueries({ queryKey: queryKeys.shares.count() });

      return true;
    } catch {
      showToast('Erreur lors du traitement');
      return false;
    } finally {
      setIsResponding(false);
    }
  }, [showToast, queryClient]);

  return { respond, isResponding };
}
