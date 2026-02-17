import { useState, useCallback } from 'react';
import type { Progress } from '@/app/types';

type UsePinProgressOptions = {
  progress: Progress;
  userId: number;
  onCompleted?: (updatedProgress: Progress) => void;
};

type UsePinProgressReturn = {
  handlePin: (e?: React.MouseEvent) => Promise<void>;
  isPinning: boolean;
};

export function usePinProgress({
  progress,
  userId,
  onCompleted,
}: UsePinProgressOptions): UsePinProgressReturn {
  const [isPinning, setIsPinning] = useState(false);

  const handlePin = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();

      if (!userId) return;

      setIsPinning(true);
      try {
        const response = await fetch(`/api/progress/${progress.id}/pin?userId=${userId}`, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const updatedProgress: Progress = {
            ...progress,
            pinned: data.pinned,
          };

          if (onCompleted) {
            onCompleted(updatedProgress);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du pin:', error);
      } finally {
        setIsPinning(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress.id, progress.pinned, userId, onCompleted]
  );

  return {
    handlePin,
    isPinning,
  };
}
