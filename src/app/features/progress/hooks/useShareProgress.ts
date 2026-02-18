import { useCallback } from 'react';
import type { Progress } from '@/app/types';
import { shareProgressAsText } from '@/app/utils/share';

export function useShareProgress(progress: Progress) {
  const handleShare = useCallback(async () => {
    await shareProgressAsText(progress);
  }, [progress]);

  return { handleShare };
}
