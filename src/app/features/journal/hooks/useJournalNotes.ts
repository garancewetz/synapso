import { useState, useEffect, useCallback } from 'react';
import type { JournalNote } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

export function useJournalNotes() {
  const { effectiveUser, loading: userLoading } = useUser();
  const [notes, setNotes] = useState<JournalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(() => {
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
          const sortedNotes = data.sort((a: JournalNote, b: JournalNote) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setNotes(sortedNotes);
        } else {
          setError('Erreur lors du chargement des notes');
          setNotes([]);
        }
      })
      .catch(() => {
        setError('Erreur lors du chargement des notes');
        setNotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveUser?.id, userLoading]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, loading: loading || userLoading, error, refetch: fetchNotes };
}
