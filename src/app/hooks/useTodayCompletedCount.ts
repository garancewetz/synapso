import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function useTodayCompletedCount() {
  const [completedToday, setCompletedToday] = useState<number | null>(null);
  const { currentUser } = useUser();

  const fetchCompletedCount = useCallback(() => {
    if (!currentUser) {
      setCompletedToday(null);
      return;
    }

    Promise.all([
      fetch(`/api/exercices?userId=${currentUser.id}`, { credentials: 'include' }).then(res => res.json()),
      fetch(`/api/users/${currentUser.id}`, { credentials: 'include' }).then(res => res.json())
    ])
      .then(([exercicesData]) => {
        if (Array.isArray(exercicesData)) {
          // Compter uniquement les exercices faits aujourd'hui (completedToday)
          const count = exercicesData.filter((ex: { completedToday?: boolean }) => {
            return ex.completedToday === true;
          }).length;
          setCompletedToday(count);
        } else {
          setCompletedToday(0);
        }
      })
      .catch(() => {
        setCompletedToday(null);
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
