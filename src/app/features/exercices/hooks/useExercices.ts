'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import type { Exercice } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchExercices } from '@/app/lib/api-queries';

type UseExercicesOptions = {
  category?: ExerciceCategory;
  equipments?: string[];
  includeArchived?: boolean;
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
export function useExercices({ category, equipments, includeArchived }: UseExercicesOptions = {}): UseExercicesReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const { isTimeMachineMode, referenceDate, referenceDateKey } = useTimeContext();
  const queryClient = useQueryClient();
  
  // ⚡ OPTIMISATION: Calculer les filtres une seule fois pour éviter la duplication
  // ⚡ FIX BUG SABLIER: Utiliser referenceDateKey comme dépendance pour garantir que les filtres se mettent à jour
  // quand la date change, même si referenceDate (objet Date) reste le même objet en mémoire
  const filters = useMemo(() => ({
    category,
    equipments,
    includeArchived,
    targetDate: isTimeMachineMode && referenceDate ? referenceDate.toISOString() : undefined,
  }), [category, equipments, includeArchived, isTimeMachineMode, referenceDate, referenceDateKey]);
  
  // ⚡ TANSTACK QUERY: Utiliser useQuery pour gérer le fetch et le cache
  // ⚡ PARALLEL QUERIES: Retirer !userLoading pour permettre le chargement en parallèle
  // TanStack Query démarrera automatiquement la requête dès que effectiveUser est disponible
  const { data: exercices = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.exercices.list(filters),
    queryFn: () => fetchExercices(filters),
    enabled: !!effectiveUser, // Démarrer dès que l'utilisateur est disponible (pas besoin d'attendre userLoading)
    // ⚡ FIX: Ne pas utiliser placeholderData en mode sablier pour éviter d'afficher les anciennes données
    // placeholderData garde les données même si la query key change (targetDate différent),
    // ce qui cause des bugs en prod où les gauges affichent les mauvaises données
    // En mode sablier, on préfère un bref chargement plutôt que des données incorrectes
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    // ⚡ OPTIMISATION: Données qui changent souvent, cache plus court
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  // ⚡ OPTIMISTIC UPDATE: Mettre à jour le cache localement pour une UI réactive
  const updateExercice = useCallback((updatedExercice: Exercice) => {
    queryClient.setQueryData<Exercice[]>(
      queryKeys.exercices.list(filters),
      (old) => {
        if (!old) return [updatedExercice];
        return old.map(ex => ex.id === updatedExercice.id ? updatedExercice : ex);
      }
    );
  }, [filters, queryClient]);

  return {
    exercices,
    // ⚡ PARALLEL QUERIES: Ne plus inclure userLoading dans le loading
    // car les requêtes démarrent en parallèle dès que l'utilisateur est disponible
    loading: isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
    updateExercice,
  };
}
