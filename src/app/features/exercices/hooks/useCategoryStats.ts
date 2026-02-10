'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ExerciceCategory } from '@/app/types/exercice';
import { useExercices } from './useExercices';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys } from '@/app/lib/api-queries';

type UseCategoryStatsReturn = {
  stats: Record<ExerciceCategory, number>;
  loading: boolean;
  refresh: () => Promise<void>;
};

const initialStats: Record<ExerciceCategory, number> = {
  UPPER_BODY: 0,
  LOWER_BODY: 0,
  STRETCHING: 0,
  CORE: 0,
};

/**
 * Hook pour charger les statistiques d'exercices complétés par catégorie
 * pour la date de référence (aujourd'hui ou date sélectionnée en mode sablier)
 * 
 * ⚡ OPTIMISATION: Utilise directement les exercices qui ont déjà `completedToday`
 * calculé côté serveur, au lieu de filtrer l'historique. Plus performant et fiable.
 * 
 * ⚡ SIMPLIFICATION: Les paramètres userId et resetFrequency ne sont plus nécessaires
 * car le calcul se fait directement depuis les exercices qui ont déjà completedToday
 * calculé pour la date de référence (via useExercices qui utilise TimeContext).
 * 
 * ⚡ FIX: Utilise referenceDateKey comme dépendance pour forcer le recalcul quand la date change
 */
export function useCategoryStats(): UseCategoryStatsReturn {
  const queryClient = useQueryClient();
  const { referenceDateKey } = useTimeContext();
  
  // ⚡ OPTIMISATION: Utiliser les exercices qui ont déjà `completedToday` calculé
  // Le serveur calcule `completedToday` pour la date de référence (targetDate)
  // via useExercices qui utilise TimeContext pour déterminer la date de référence
  // ⚡ NOTE: TimeContext invalide déjà les queries d'exercices quand la date change,
  // donc pas besoin de refetch explicite ici
  const { exercices, loading: exercicesLoading } = useExercices();

  // ⚡ CALCUL: Compter les exercices complétés pour la date de référence par catégorie
  // ⚡ FIX ROBUSTE: Forcer le recalcul en utilisant referenceDateKey comme clé de dépendance
  // ⚡ FIX: Pendant le chargement, retourner des stats à zéro pour éviter d'afficher les anciennes données
  // ⚡ OPTIMISATION: Mémoriser les exercices filtrés pour éviter les recalculs inutiles
  // ⚡ FIX BUG SABLIER: Ajouter referenceDateKey comme dépendance pour forcer le recalcul quand la date change
  const completedExercices = useMemo(() => {
    if (exercicesLoading || !exercices.length) {
      return [];
    }
    // Filtrer une seule fois les exercices complétés pour la date de référence
    return exercices.filter(ex => ex.completedToday === true);
  }, [exercices, exercicesLoading, referenceDateKey]);

  const stats = useMemo(() => {
    const newStats: Record<ExerciceCategory, number> = { ...initialStats };
    
    // ⚡ FIX: Si on charge, retourner des stats à zéro pour éviter d'afficher les anciennes données
    // Cela garantit que les gauges se mettent à jour correctement quand on change de date
    if (exercicesLoading) {
      return newStats;
    }
    
    if (!completedExercices.length) {
      return newStats;
    }
    
    // ⚡ OPTIMISATION: Compter uniquement les exercices déjà filtrés (plus rapide)
    // completedToday est calculé côté serveur pour la date de référence (referenceDateKey)
    completedExercices.forEach((exercice) => {
      // ⚡ FIX: Vérifier explicitement que la catégorie est valide
      if (exercice.category && exercice.category in newStats) {
        newStats[exercice.category as ExerciceCategory]++;
      }
    });
    
    return newStats;
  }, [completedExercices, referenceDateKey, exercicesLoading]);

  return {
    stats,
    loading: exercicesLoading,
    refresh: async () => {
      // Invalider les queries d'exercices pour forcer le refetch
      await queryClient.invalidateQueries({
        queryKey: queryKeys.exercices.all,
        refetchType: 'active',
      });
    },
  };
}
