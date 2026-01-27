import { useState, useCallback } from 'react';
import type { Exercice } from '@/app/types';
import { triggerCompletedCountRefresh } from '@/app/hooks/useTodayCompletedCount';

type UseCompleteExerciceOptions = {
  exercice: Exercice;
  userId: number;
  onCompleted?: (updatedExercice: Exercice) => void;
  refreshHistory?: () => void;
};

type UseCompleteExerciceReturn = {
  handleComplete: (e: React.MouseEvent) => Promise<void>;
  isCompleting: boolean;
  showSuccess: boolean;
};

export function useCompleteExercice({
  exercice,
  userId,
  onCompleted,
  refreshHistory,
}: UseCompleteExerciceOptions): UseCompleteExerciceReturn {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleComplete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!userId) return;

      setIsCompleting(true);
      try {
        const response = await fetch(`/api/exercices/${exercice.id}/complete?userId=${userId}`, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const wasCompletedToday = exercice.completedToday;
          
          const updatedExercice: Exercice = {
            ...exercice,
            completed: data.completed,
            completedToday: data.completedToday ?? false,
            completedAt: data.completedAt ? new Date(data.completedAt) : null,
            weeklyCompletions: data.weeklyCompletions || exercice.weeklyCompletions,
          };

          if (!wasCompletedToday && updatedExercice.completedToday) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
          }

          if (onCompleted) {
            onCompleted(updatedExercice);
          }

          triggerCompletedCountRefresh();
          if (refreshHistory) {
            refreshHistory();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
      } finally {
        setIsCompleting(false);
      }
    },
    // On utilise seulement les propriétés nécessaires de exercice pour éviter les re-créations inutiles
    // React.memo sur ExerciceCard garantit que le composant se re-render quand l'exercice change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercice.id, exercice.completedToday, exercice.weeklyCompletions, userId, onCompleted, refreshHistory]
  );

  return {
    handleComplete,
    isCompleting,
    showSuccess,
  };
}

