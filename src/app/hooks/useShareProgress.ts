import { useCallback, type RefObject } from 'react';
import type { Progress } from '@/app/types';
import { shareProgressImage } from '@/app/utils/share.utils';

/**
 * Hook pour partager un progrès sur WhatsApp
 * Capture la card en image et la partage
 */
export function useShareProgress(progress: Progress, cardRef: RefObject<HTMLDivElement | null>) {
  const handleShare = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }
    await shareProgressImage(cardRef.current, progress);
  }, [cardRef, progress]);

  return { handleShare };
}

