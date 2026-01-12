'use client';

import { useMemo, useCallback } from 'react';
import type { Progress } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { BaseCard, IconButton } from '@/app/components/ui';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { extractProgressTags } from '@/app/utils/progress.utils';
import { GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';
import clsx from 'clsx';

type Props = {
  progress: Progress;
  onEdit?: (progress: Progress) => void;
  compact?: boolean;
};

/**
 * Carte de progrès individuelle - Version simplifiée
 * Style doré avec étoile, affichage minimaliste pour vue d'ensemble rapide
 * Principe : minimiser la charge cognitive, maximiser l'encouragement
 */
export function ProgressCard({ progress, onEdit, compact = false }: Props) {
  // Mémoriser l'extraction des tags (pour nettoyer le contenu)
  const { cleanContent } = useMemo(
    () => extractProgressTags(progress.content),
    [progress.content]
  );
  
  // Mémoriser le handler d'édition
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(progress);
    }
  }, [onEdit, progress]);
  
  return (
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
              {cleanContent}
            </h3>
          </div>
          
          {/* Date - discrète et élégante */}
          <div className="text-left">
            <p className="text-xs text-amber-700/80 font-medium tracking-wide">
              {formatVictoryDate(progress.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Footer avec bouton éditer en bas - comme ExerciceCard */}
        {onEdit && (
          <BaseCard.Footer onClick={handleEdit}>
            <div className="flex justify-end">
              <IconButton
                title="Modifier"
                aria-label="Modifier ce progrès"
              >
                <EditIcon className="w-4 h-4" />
              </IconButton>
            </div>
          </BaseCard.Footer>
        )}
      </BaseCard.Content>
    </BaseCard>
  );
}

