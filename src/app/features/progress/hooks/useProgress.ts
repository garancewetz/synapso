'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
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

/**
 * @deprecated Utiliser queryClient.invalidateQueries({ queryKey: queryKeys.progress.all }) à la place
 * TanStack Query gère automatiquement la réactivité via les invalidations
 */
export function triggerProgressRefresh(): void {
  console.warn('triggerProgressRefresh is deprecated. Use queryClient.invalidateQueries instead.');
}

/**
 * Hook pour récupérer et gérer les progrès
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { effectiveUser } = useUser();
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

  // ⚡ TANSTACK QUERY: La réactivité est gérée automatiquement via les invalidations
  // Plus besoin d'écouter des événements personnalisés - TanStack Query refetch automatiquement

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
