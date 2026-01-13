'use client';

import { useMemo } from 'react';
import type { Progress } from '@/app/types';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { formatTime } from '@/app/utils/date.utils';
import { extractProgressTags } from '@/app/utils/progress.utils';
import { Card } from '@/app/components/ui/Card';

type Props = {
  progress: Progress;
};

/**
 * Carte de progrès ultra-compacte pour la modale de détail du jour
 * Affiche uniquement : emoji, titre (clean content) et heure
 * Utilise Card pour la cohérence du système de design
 */
export function ProgressCardCompact({ progress }: Props) {
  // Extraire le clean content (sans les tags)
  const { cleanContent } = useMemo(
    () => extractProgressTags(progress.content),
    [progress.content]
  );
  
  return (
    <Card
      variant="subtle"
      padding="none"
      className="bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-200"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Badge icône doré */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-400 to-yellow-500">
          <span className="text-lg flex items-center justify-center">{PROGRESS_EMOJIS.STAR_BRIGHT}</span>
        </div>
        
        {/* Titre - clean content sans tags */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {cleanContent}
          </p>
        </div>
        
        {/* Heure */}
        <span className="text-xs text-gray-500 shrink-0 bg-white/80 px-2 py-1 rounded-lg">
          {formatTime(progress.createdAt)}
        </span>
      </div>
    </Card>
  );
}

