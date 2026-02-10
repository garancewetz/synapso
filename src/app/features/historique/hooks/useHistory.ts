'use client';

import { useQuery } from '@tanstack/react-query';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { queryKeys, fetchHistory } from '@/app/lib/api-queries';

type UseHistoryOptions = {
  /**
   * Nombre de jours à charger depuis aujourd'hui (par défaut: 40 jours)
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
 * 💡 Pour le heatmap de la page d'accueil, préférer useHistoryContext() qui
 * se met à jour automatiquement quand un exercice est complété.
 */
export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { days = 40 } = options;
  const { effectiveUser, loading: userLoading } = useUser();

  // ⚡ PARALLEL QUERIES: Retirer !userLoading pour permettre le chargement en parallèle
  const { data: history = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.history.list({ days: days || undefined }),
    queryFn: () => fetchHistory({ days: days || undefined }),
    enabled: !!effectiveUser, // Démarrer dès que l'utilisateur est disponible (pas besoin d'attendre userLoading)
    // ⚡ TRANSITION FLUIDE: Garder les données précédentes pendant le chargement
    // ⚡ FIX: Ne pas utiliser placeholderData pour les invalidations actives (refetchType: 'active')
    // car cela peut masquer les changements immédiats après suppression
    placeholderData: (previousData) => previousData,
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
