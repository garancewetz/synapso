import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function useTodayCompletedCount() {
  const [completedToday, setCompletedToday] = useState(0);
  const { currentUser } = useUser();

  const fetchCompletedCount = useCallback(() => {
    if (USE_MOCK_DATA) {
      const today = new Date();
      const count = MOCK_EXERCICES.filter(ex => {
        if (!ex.completed || !ex.completedAt) return false;
        const completedDate = new Date(ex.completedAt);
        return (
          completedDate.getDate() === today.getDate() &&
          completedDate.getMonth() === today.getMonth() &&
          completedDate.getFullYear() === today.getFullYear()
        );
      }).length;
      setCompletedToday(count);
      return;
    }

    if (!currentUser) {
      setCompletedToday(0);
      return;
    }

    fetch(`/api/exercices?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const today = new Date();
          const count = data.filter((ex: { completed?: boolean; completedAt?: string | Date | null }) => {
            if (!ex.completed || !ex.completedAt) return false;
            const completedDate = new Date(ex.completedAt);
            return (
              completedDate.getDate() === today.getDate() &&
              completedDate.getMonth() === today.getMonth() &&
              completedDate.getFullYear() === today.getFullYear()
            );
          }).length;
          setCompletedToday(count);
        } else {
          setCompletedToday(0);
        }
      })
      .catch(() => {
        setCompletedToday(0);
      });
  }, [currentUser]);

  useEffect(() => {
    fetchCompletedCount();

    // Écouter l'événement de rafraîchissement
    const handleRefresh = () => {
      fetchCompletedCount();
    };

    window.addEventListener(REFRESH_EVENT, handleRefresh);

    return () => {
      window.removeEventListener(REFRESH_EVENT, handleRefresh);
    };
  }, [fetchCompletedCount]);

  return completedToday;
}

// Fonction utilitaire pour déclencher le rafraîchissement
export function triggerCompletedCountRefresh() {
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
}

