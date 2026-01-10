import { useState, useEffect, useCallback } from 'react';
import type { AphasieItem } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

/**
 * Hook pour récupérer et gérer les items aphasie (citations)
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useAphasieItems() {
  const { effectiveUser, loading: userLoading } = useUser();
  const [items, setItems] = useState<AphasieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(() => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetch('/api/aphasie', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Trier par date (plus récente d'abord), utiliser createdAt si date n'est pas renseignée
          const sortedItems = data.sort((a, b) => {
            const dateA = a.date || a.createdAt;
            const dateB = b.date || b.createdAt;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          });
          setItems(sortedItems);
        } else {
          console.error('API error:', data);
          setError('Erreur lors du chargement des citations');
          setItems([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError('Erreur lors du chargement des citations');
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading: loading || userLoading, error, refetch: fetchItems };
}
