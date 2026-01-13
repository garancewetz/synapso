'use client';

import { useCallback } from 'react';
import type { Progress } from '@/app/types';
import { IconButton } from './IconButton';
import { ShareIcon } from './icons';
import { formatProgressForWhatsApp, shareOnWhatsApp } from '@/app/utils/share.utils';

type Props = {
  progress: Progress;
  className?: string;
};

/**
 * Bouton de partage WhatsApp pour un progrès
 * Ouvre WhatsApp avec le message formaté du progrès
 */
export function ShareButton({ progress, className }: Props) {
  const handleShare = useCallback(() => {
    const message = formatProgressForWhatsApp(progress);
    shareOnWhatsApp(message);
  }, [progress]);

  return (
    <IconButton
      onClick={handleShare}
      title="Partager sur WhatsApp"
      aria-label={`Partager ce progrès sur WhatsApp : ${progress.content}`}
      className={className}
    >
      <ShareIcon className="w-4 h-4" />
    </IconButton>
  );
}

