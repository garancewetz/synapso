import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { isCompletedToday } from '@/app/utils/resetFrequency.utils';

const REFRESH_EVENT = 'exercice-completed-refresh';

export function useTodayCompletedCount() {
  const [completedToday, setCompletedToday] = useState<number | null>(null);
  const { effectiveUser } = useUser();

  const fetchCompletedCount = useCallback(() => {
    if (!effectiveUser) {
      setCompletedToday(null);
      return;
    }

    Promise.all([
      fetch(`/api/exercices?userId=${effectiveUser.id}`, { credentials: 'include' }).then(res => res.json()),
    ])
      .then(([exercicesData]) => {
        if (Array.isArray(exercicesData)) {
          // Compter uniquement les exercices complétés aujourd'hui (toujours, indépendamment du resetFrequency)
          const count = exercicesData.filter((ex: { completedAt?: string | Date | null }) => {
            if (!ex.completedAt) return false;
            const completedDate = ex.completedAt instanceof Date ? ex.completedAt : new Date(ex.completedAt);
            return isCompletedToday(completedDate);
          }).length;
          setCompletedToday(count);
        } else {
          setCompletedToday(0);
        }
      })
      .catch(() => {
        setCompletedToday(null);
      });
  }, [effectiveUser]);

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
