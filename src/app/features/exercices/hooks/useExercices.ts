'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { Exercice } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';
import { PERSISTED_QUERY_GC_TIME } from '@/app/providers/queryPersister';
// ⚡ FIX TIMEZONE: On envoie le dateKey (yyyy-MM-dd) directement, pas un ISO string
// Voir CLAUDE.md → section "Timezone" pour comprendre pourquoi

type UseExercicesOptions = {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
  // Server-provided initial exercices, hydrated as initialData to skip the client
  // fetch at mount. Currently unused (the entry route `/` is static — no SSR data);
  // kept as a brick for a future PPR/streaming-SSR home.
  initialData?: Exercice[];
};

type UseExercicesReturn = {
  exercices: Exercice[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateExercice: (updatedExercice: Exercice) => void;
};

/**
 * Hook personnalisé pour gérer les exercices
 * Centralise la logique de récupération et de mise à jour des exercices
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useExercices({ category, equipments, includeArchived, initialData }: UseExercicesOptions = {}): UseExercicesReturn {
  const { effectiveUser } = useUser();
  const { referenceDateKey } = useTimeContext();
  const queryClient = useQueryClient();
  
  // ⚡ Toujours envoyer targetDate (referenceDateKey) pour que l'API utilise le même "jour" que le client.
  // Sinon en "aujourd'hui" le serveur (UTC) peut être encore à la veille → completedToday incohérent avec la modal / objectif.
  const filters = useMemo(() => {
    return {
      category,
      equipments,
      includeArchived,
      targetDate: referenceDateKey ?? undefined,
      resetFrequency: effectiveUser?.resetFrequency || 'DAILY',
    };
  }, [category, equipments, includeArchived, referenceDateKey, effectiveUser?.resetFrequency]);
  
  // ⚡ TANSTACK QUERY: Utiliser useQuery pour gérer le fetch et le cache
  // ⚡ PARALLEL QUERIES: Retirer !userLoading pour permettre le chargement en parallèle
  // TanStack Query démarrera automatiquement la requête dès que effectiveUser est disponible
  const queryResult = useQuery({
    queryKey: queryKeys.exercices.list(filters),
    queryFn: () => fetchExercices(filters),
    enabled: !!effectiveUser, // Démarrer dès que l'utilisateur est disponible (pas besoin d'attendre userLoading)
    placeholderData: undefined,
    // When initialData is provided, mark it fresh → no immediate refetch at mount.
    // Currently always undefined (static entry route); kept for a future PPR home.
    initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    staleTime: 30 * 1000, // 30 secondes — évite les refetches excessifs
    // Persisted root: keep gcTime >= persist maxAge so the snapshot survives.
    gcTime: PERSISTED_QUERY_GC_TIME,
    refetchOnMount: true, // refetch seulement si stale
    refetchOnWindowFocus: false,
  });

  const { data: exercices = [], isLoading, error, refetch } = queryResult;

  // ⚡ OPTIMISTIC UPDATE: Mettre à jour toutes les listes d'exercices en cache (page courante + archivés)
  // pour que la navigation vers "archivés" affiche tout de suite l'exercice sans refetch ni loader
  // getQueriesData + setQueryData car en v5 l'updater de setQueriesData ne reçoit pas la query (donc pas les filters)
  const updateExercice = useCallback((updatedExercice: Exercice) => {
    type ListFilters = { includeArchived?: boolean };
    const entries = queryClient.getQueriesData<Exercice[]>({
      queryKey: queryKeys.exercices.lists(),
      exact: false,
    });
    for (const [queryKey, old] of entries) {
      if (!old) continue;
      const listFilters = queryKey[2] as ListFilters | undefined;
      const hasExercise = old.some((ex) => ex.id === updatedExercice.id);
      // Ne mettre à jour que les listes qui contiennent déjà l'exercice
      // pour éviter de l'ajouter dans des listes d'autres catégories
      if (!hasExercise) continue;
      let next = old.map((ex) => (ex.id === updatedExercice.id ? updatedExercice : ex));
      const isArchivedList = listFilters?.includeArchived === true;
      // Retirer un exercice archivé des listes non-archivées (il ne devrait plus y apparaître)
      if (!isArchivedList && updatedExercice.archived) {
        next = next.filter((ex) => ex.id !== updatedExercice.id);
      }
      queryClient.setQueryData<Exercice[]>(queryKey, next);
    }
  }, [queryClient]);

  return {
    exercices,
    // ⚡ PARALLEL QUERIES: Ne plus inclure userLoading dans le loading
    // car les requêtes démarrent en parallèle dès que l'utilisateur est disponible
    // ⚡ FIX: Utiliser uniquement isLoading (pas isFetching) pour l'état de chargement
    // isLoading = true uniquement quand il n'y a PAS de données en cache (premier chargement)
    // isFetching = true aussi lors des refetch en arrière-plan (invalidation après complétion)
    // Inclure isFetching causait un rechargement visuel de toute la page catégorie
    // à chaque complétion d'exercice (alors que setQueriesData avait déjà mis à jour les données)
    loading: isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
    updateExercice,
  };
}
