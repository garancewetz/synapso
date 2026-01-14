'use client';

import { useMemo } from 'react';
import type { Progress } from '@/app/types';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import { formatTime } from '@/app/utils/date.utils';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress } from '@/app/utils/progress.utils';
import { CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { Card } from '@/app/components/ui/Card';

type Props = {
  progress: Progress;
};

/**
 * Carte de progrès ultra-compacte pour la modale de détail du jour
 * Affiche uniquement : texte brut, catégorie et heure
 * Utilise Card pour la cohérence du système de design
 */
export function ProgressCardCompact({ progress }: Props) {
  // Déterminer la catégorie à partir de l'emoji
  const categoryLabel = useMemo(() => {
    if (isOrthophonieProgress(progress.emoji)) {
      return 'Orthophonie';
    }
    const category = getExerciceCategoryFromEmoji(progress.emoji);
    return category ? CATEGORY_LABELS_SHORT[category] : null;
  }, [progress.emoji]);
  
  return (
    <Card
      variant="subtle"
      padding="none"
      bgColor="bg-gradient-to-r from-amber-50 to-yellow-50"
      className="border-yellow-200"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Badge icône doré */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-400 to-yellow-500">
          <span className="text-lg flex items-center justify-center">{PROGRESS_EMOJIS.STAR_BRIGHT}</span>
        </div>
        
        {/* Titre - texte brut */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {progress.content}
          </p>
          {categoryLabel && (
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              {categoryLabel}
            </p>
          )}
        </div>
        
        {/* Heure */}
        <span className="text-xs text-gray-500 shrink-0 bg-white/80 px-2 py-1 rounded-lg">
          {formatTime(progress.createdAt)}
        </span>
      </div>
    </Card>
  );
}

