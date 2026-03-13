'use client';

import { useState, useCallback } from 'react';
import type { MediaData } from '@/app/types';

export function useExerciceCardMedia(media: MediaData | undefined | null) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleOpenMedia = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (media?.photos && media.photos.length > 0) {
      setLightboxIndex(0);
    }
  }, [media]);

  const handleLightboxOpen = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const hasPhotos = !!(media?.photos && media.photos.length > 0);

  return {
    lightboxIndex,
    handleOpenMedia,
    handleLightboxOpen,
    handleLightboxClose,
    hasPhotos,
  };
}
