import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function useTodayCompletedCount() {
  const [completedToday, setCompletedToday] = useState<number | null>(null);
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
      setCompletedToday(null);
      return;
    }

    Promise.all([
      fetch(`/api/exercices?userId=${currentUser.id}`).then(res => res.json()),
      fetch(`/api/users/${currentUser.id}`).then(res => res.json())
    ])
      .then(([exercicesData, userData]) => {
        if (Array.isArray(exercicesData)) {
          const resetFrequency = userData?.resetFrequency || 'DAILY';
          const now = new Date();
          
          let startOfPeriod: Date;
          
          if (resetFrequency === 'DAILY') {
            startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (resetFrequency === 'WEEKLY') {
            startOfPeriod = new Date(now);
            startOfPeriod.setDate(now.getDate() - now.getDay()); // Dimanche = 0
            startOfPeriod.setHours(0, 0, 0, 0);
          } else {
            startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          }
          
          const count = exercicesData.filter((ex: { completed?: boolean; completedAt?: string | Date | null }) => {
            if (!ex.completed || !ex.completedAt) return false;
            const completedDate = new Date(ex.completedAt);
            return completedDate.getTime() >= startOfPeriod.getTime();
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

