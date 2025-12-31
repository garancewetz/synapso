import { useState, useEffect } from 'react';
import type { AphasieItem } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

/**
 * Hook pour récupérer et gérer les items aphasie (citations)
 */
export function useAphasieItems() {
  const { currentUser } = useUser();
  const [items, setItems] = useState<AphasieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetch(`/api/aphasie?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
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
  };

  useEffect(() => {
    fetchItems();
  }, [currentUser]);

  return { items, loading, error, refetch: fetchItems };
}

