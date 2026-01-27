import { useState, useCallback } from 'react';
import type { Exercice } from '@/app/types';

type UsePinExerciceOptions = {
  exercice: Exercice;
  userId: number;
  onCompleted?: (updatedExercice: Exercice) => void;
};

type UsePinExerciceReturn = {
  handlePin: (e: React.MouseEvent) => Promise<void>;
  isPinning: boolean;
};

export function usePinExercice({
  exercice,
  userId,
  onCompleted,
}: UsePinExerciceOptions): UsePinExerciceReturn {
  const [isPinning, setIsPinning] = useState(false);

  const handlePin = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!userId) return;

      setIsPinning(true);
      try {
        const response = await fetch(`/api/exercices/${exercice.id}/pin?userId=${userId}`, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const updatedExercice: Exercice = {
            ...exercice,
            pinned: data.pinned,
          };

          if (onCompleted) {
            onCompleted(updatedExercice);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du pin:', error);
      } finally {
        setIsPinning(false);
      }
    },
    // On utilise seulement exercice.id et exercice.pinned, pas tout l'objet
    // pour éviter les re-créations inutiles du callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercice.id, exercice.pinned, userId, onCompleted]
  );

  return {
    handlePin,
    isPinning,
  };
}

