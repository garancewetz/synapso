'use client';

import { useMemo, useCallback, useRef } from 'react';
import type { Progress } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { BaseCard, Button } from '@/app/components/ui';
import { ShareIcon } from '@/app/components/ui/icons';
import { useShareProgress } from '@/app/hooks/useShareProgress';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { getExerciceCategoryFromEmoji, isOrthophonieProgress } from '@/app/utils/progress.utils';
import { CATEGORY_LABELS_SHORT } from '@/app/constants/exercice.constants';
import { GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';
import clsx from 'clsx';
import { useUser } from '@/app/contexts/UserContext';

type Props = {
  progress: Progress;
  onEdit?: (progress: Progress) => void;
  onShare?: (progress: Progress) => void;
  compact?: boolean;
};

/**
 * Carte de progrès individuelle - Version simplifiée
 * Style doré avec étoile, affichage minimaliste pour vue d'ensemble rapide
 * Principe : minimiser la charge cognitive, maximiser l'encouragement
 */
export function ProgressCard({ progress, onEdit, onShare, compact = false }: Props) {
  const { effectiveUser } = useUser();
  const cardRef = useRef<HTMLDivElement>(null);
  const { handleShare } = useShareProgress(progress, cardRef);
  
  // Déterminer la catégorie à partir de l'emoji
  const categoryLabel = useMemo(() => {
    if (isOrthophonieProgress(progress.emoji)) {
      return 'Orthophonie';
    }
    const category = getExerciceCategoryFromEmoji(progress.emoji);
    return category ? CATEGORY_LABELS_SHORT[category] : null;
  }, [progress.emoji]);
  
  // Mémoriser le handler d'édition
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(progress);
    }
  }, [onEdit, progress]);

  // Handler de partage
  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleShare();
    if (onShare) {
      onShare(progress);
    }
  }, [handleShare, onShare, progress]);
  
  
  return (
    <div ref={cardRef}>
      <BaseCard 
      isGolden 
      className={clsx(
        'relative',
        '!bg-gradient-to-br !from-amber-50/95 !via-yellow-50/90 !to-amber-100/85',
        '!border !border-amber-200/60',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300',
        'hover:border-amber-300/80',
        'hover:shadow-amber-200/20 hover:shadow-lg'
      )}
    >
      {/* Accent doré sur le côté */}
      <BaseCard.Accent />
  
      
      <BaseCard.Content className="flex flex-col">
        <div className={clsx(
          compact ? 'p-3' : 'p-4 md:p-5'
        )}>
          {/* Titre centré - contenu principal */}
          <div className="text-left mb-3">
            <h3 className={clsx(
              GOLDEN_TEXT_STYLES.primary,
              compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl',
              'font-bold leading-tight tracking-tight'
            )}>
              {progress.content}
            </h3>
          </div>
          
          {/* Catégorie et Date */}
          <div className="text-left flex items-center gap-2">
            {categoryLabel && (
              <span className="text-xs text-amber-600 font-medium">
                {categoryLabel}
              </span>
            )}
            {categoryLabel && (
              <span className="text-xs text-amber-700/60">•</span>
            )}
            <p className="text-xs text-amber-700/80 font-medium tracking-wide">
              {formatVictoryDate(progress.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Footer avec boutons d'action en bas */}
        {(onEdit || onShare) && (
          <BaseCard.Footer>
            <div className={clsx(
              'flex gap-2',
              effectiveUser?.dominantHand === 'LEFT' ? 'flex-row-reverse' : 'flex-row',
              effectiveUser?.dominantHand === 'LEFT' ? 'justify-start' : 'justify-end'
            )}>
              {onShare && (
                <Button
                  variant="golden"
                  size="sm"
                  icon={<ShareIcon className="w-4 h-4" />}
                  onClick={handleShareClick}
                  aria-label={`Partager ce progrès : ${progress.content}`}
                >
                  Partager
                </Button>
              )}
              {onEdit && (
                <Button
                  iconOnly
                  onClick={handleEdit}
                  title="Modifier"
                  aria-label="Modifier ce progrès"
                >
                  <EditIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </BaseCard.Footer>
        )}
      </BaseCard.Content>
    </BaseCard>
    </div>
  );
}

