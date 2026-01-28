import { useState, useEffect, useCallback } from 'react';
import type { JournalTask } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';

type UseJournalTasksReturn = {
  tasks: JournalTask[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * Hook pour récupérer et gérer les tâches du journal
 * L'userId est automatiquement récupéré depuis le cookie côté serveur
 */
export function useJournalTasks(): UseJournalTasksReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const [tasks, setTasks] = useState<JournalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(() => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }

    if (!effectiveUser) {
      setLoading(false);
      setTasks([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch('/api/journal/tasks', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error('API error:', data);
          setError(new Error('Format de données invalide'));
          setTasks([]);
        }
      })
      .catch(err => {
        const errorMessage = err instanceof Error ? err : new Error('Erreur lors de la récupération des tâches');
        console.error('Fetch error:', errorMessage);
        setError(errorMessage);
        setTasks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading: loading || userLoading, error, refetch: fetchTasks };
}

