import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { isCompletedInPeriod } from '@/app/utils/resetFrequency.utils';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function useTodayCompletedCount() {
  const [completedToday, setCompletedToday] = useState<number | null>(null);
  const { currentUser } = useUser();

  const fetchCompletedCount = useCallback(() => {
    if (!currentUser) {
      setCompletedToday(null);
      return;
    }

    const resetFrequency = currentUser.resetFrequency || 'DAILY';

    Promise.all([
      fetch(`/api/exercices?userId=${currentUser.id}`, { credentials: 'include' }).then(res => res.json()),
    ])
      .then(([exercicesData]) => {
        if (Array.isArray(exercicesData)) {
          // Compter les exercices complétés dans la période actuelle (jour ou semaine selon resetFrequency)
          const count = exercicesData.filter((ex: { completedAt?: string | Date | null }) => {
            if (!ex.completedAt) return false;
            const completedDate = ex.completedAt instanceof Date ? ex.completedAt : new Date(ex.completedAt);
            return isCompletedInPeriod(completedDate, resetFrequency);
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
