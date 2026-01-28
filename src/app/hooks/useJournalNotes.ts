import { useState, useEffect, useCallback } from 'react';
import type { JournalNote } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

/**
 * Hook pour récupérer et gérer les notes du journal
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useJournalNotes() {
  const { effectiveUser, loading: userLoading } = useUser();
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(() => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setNotes([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    fetch('/api/journal/notes', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Trier par date (plus récente d'abord), utiliser createdAt si date n'est pas renseignée
          const sortedNotes = data.sort((a, b) => {
            const dateA = a.date || a.createdAt;
            const dateB = b.date || b.createdAt;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          });
          setNotes(sortedNotes);
        } else {
          console.error('API error:', data);
          setError('Erreur lors du chargement des notes');
          setNotes([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError('Erreur lors du chargement des notes');
        setNotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, loading: loading || userLoading, error, refetch: fetchNotes };
}

