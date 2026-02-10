'use client';

import { useQuery } from '@tanstack/react-query';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';

type UseHistoryOptions = {
  /**
   * Nombre de jours à charger depuis la date de référence (par défaut: 40 jours)
   * Passer null pour charger tout l'historique
   */
  days?: number | null;
};

type UseHistoryReturn = {
  history: HistoryEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook pour récupérer et gérer l'historique des exercices avec des options personnalisées
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 * 
 * ⚡ PERFORMANCE: Par défaut, charge seulement les 40 derniers jours pour réduire
 * le transfert de données. Passer days={null} pour charger tout l'historique.
 * 
 * ⚡ FIX MODE SABLIER: Utilise la date de référence (aujourd'hui ou date sélectionnée)
 * pour charger les données depuis la bonne date.
 * 
 * 💡 Pour le heatmap de la page d'accueil, préférer useHistoryContext() qui
 * se met à jour automatiquement quand un exercice est complété.
 */
export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { days = 40 } = options;
  const { effectiveUser, loading: userLoading } = useUser();
  const { referenceDate, isTimeMachineMode } = useTimeContext();

  // ⚡ FIX MODE SABLIER: Utiliser referenceDate pour charger les données depuis la bonne date
  // En mode sablier, on charge depuis la date sélectionnée, sinon depuis aujourd'hui
  const { data: history = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.history.list({ days: days || undefined, referenceDate: isTimeMachineMode ? referenceDate.toISOString() : undefined }),
    queryFn: () => fetchHistory({ days: days || undefined, referenceDate: isTimeMachineMode ? referenceDate : undefined }),
    enabled: !!effectiveUser, // Démarrer dès que l'utilisateur est disponible (pas besoin d'attendre userLoading)
    // ⚡ FIX MODE SABLIER: Ne pas utiliser placeholderData en mode sablier pour éviter d'afficher les anciennes données
    placeholderData: isTimeMachineMode ? undefined : (previousData) => previousData,
    // ⚡ OPTIMISATION: Données qui changent souvent, cache plus court
    staleTime: 10000, // 10 secondes
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

  return { 
    history, 
    // ⚡ PARALLEL QUERIES: Ne plus inclure userLoading dans le loading
    // car les requêtes démarrent en parallèle dès que l'utilisateur est disponible
    loading: isLoading, 
    error: error as Error | null, 
    refetch: () => { refetch(); },
  };
}
