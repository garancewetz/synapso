import { useCallback } from 'react';
import type { Progress } from '@/app/types';
import { shareProgressWithImage } from '@/app/utils/share.utils';

/**
 * Hook pour partager un progrès avec une image composite (canvas natif)
 */
export function useShareProgress(progress: Progress) {
  const handleShare = useCallback(async () => {
    await shareProgressWithImage(progress);
  }, [progress]);

  return { handleShare };
}

