import { useCallback, type RefObject } from 'react';
import type { Exercice } from '@/app/types';
import { shareExerciceImage } from '@/app/utils/share';

export function useShareExercice(
  exercice: Exercice,
  cardRef: RefObject<HTMLDivElement | null>
) {
  const handleShare = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }
    await shareExerciceImage(cardRef.current, exercice);
  }, [cardRef, exercice]);

  return { handleShare };
}
