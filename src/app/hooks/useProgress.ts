'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useCallback } from 'react';
import type { Progress } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchProgress } from '@/app/lib/api-queries';

type UseProgressOptions = {
  limit?: number;
};

type UseProgressReturn = {
  progressList: Progress[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  lastProgress: Progress | null;
};

// Événement personnalisé pour notifier tous les hooks useProgress
const PROGRESS_REFRESH_EVENT = 'progress-refresh';

/**
 * Déclenche un rafraîchissement de tous les hooks useProgress
 * Appelé après l'ajout, la modification ou la suppression d'un progrès
 */
export function triggerProgressRefresh(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_REFRESH_EVENT));
  }
}

/**
 * Hook pour récupérer et gérer les progrès
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const { limit } = options;

  // ⚡ PARALLEL QUERIES: Retirer !userLoading pour permettre le chargement en parallèle
  // TanStack Query démarrera automatiquement la requête dès que effectiveUser est disponible
  const { data: progressList = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.progress.list({ limit }),
    queryFn: () => fetchProgress({ limit }),
    enabled: !!effectiveUser, // Démarrer dès que l'utilisateur est disponible (pas besoin d'attendre userLoading)
    // ⚡ TRANSITION FLUIDE: Garder les données précédentes pendant le chargement
    placeholderData: (previousData) => previousData,
    // ⚡ OPTIMISATION: Données qui changent souvent, cache plus court
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // ⚡ EVENT-DRIVEN: Écouter les événements de rafraîchissement
  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(PROGRESS_REFRESH_EVENT, handleRefresh);
    };
  }, [refetch]);

  const lastProgress = useMemo(() => {
    return progressList.length > 0 ? progressList[0] : null;
  }, [progressList]);

  const refetchCallback = useCallback(() => {
    refetch();
  }, [refetch]);

  return { 
    progressList, 
    // ⚡ PARALLEL QUERIES: Ne plus inclure userLoading dans le loading
    // car les requêtes démarrent en parallèle dès que l'utilisateur est disponible
    loading: isLoading, 
    error: error as Error | null, 
    refetch: refetchCallback,
    lastProgress,
  };
}
