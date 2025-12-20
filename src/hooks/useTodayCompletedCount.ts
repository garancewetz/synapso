import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';
import { isCompletedToday } from '@/utils/resetFrequency.utils';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function useTodayCompletedCount() {
  const [completedToday, setCompletedToday] = useState<number | null>(null);
  const { currentUser } = useUser();

  const fetchCompletedCount = useCallback(() => {
    if (USE_MOCK_DATA) {
      const count = MOCK_EXERCICES.filter(ex => {
        if (!ex.completed || !ex.completedAt) return false;
        return isCompletedToday(new Date(ex.completedAt));
      }).length;
      setCompletedToday(count);
      return;
    }

    if (!currentUser) {
      setCompletedToday(null);
      return;
    }

    Promise.all([
      fetch(`/api/exercices?userId=${currentUser.id}`).then(res => res.json()),
      fetch(`/api/users/${currentUser.id}`).then(res => res.json())
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

