import { useCallback } from 'react';
import type { Progress } from '@/app/types';
import { shareProgressWithImage } from '@/app/utils/share';

export function useShareProgress(progress: Progress) {
  const handleShare = useCallback(async () => {
    await shareProgressWithImage(progress);
  }, [progress]);

  return { handleShare };
}
