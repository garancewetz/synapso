'use client';

import { useMemo, useCallback } from 'react';
import type { Progress } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { IconButton, Badge, BaseCard } from '@/app/components/ui';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { extractProgressTags } from '@/app/utils/progress.utils';
import { useProgressBadges } from '@/app/hooks/useProgressBadges';
import { GOLDEN_BADGE_STYLES, GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';
import { PROGRESS_EMOJIS } from '@/app/constants/emoji.constants';
import clsx from 'clsx';

type Props = {
  progress: Progress;
  onEdit?: (progress: Progress) => void;
  compact?: boolean;
};

/**
 * Carte de progrès individuelle
 * Style doré avec étoile et emoji de catégorie
 */
export function ProgressCard({ progress, onEdit, compact = false }: Props) {
  // Mémoriser l'extraction des tags (calcul coûteux)
  const { cleanContent, tags } = useMemo(
    () => extractProgressTags(progress.content),
    [progress.content]
  );
  
  // Calculer les badges via le hook factorisé
  const { typeBadge, categoryBadge } = useProgressBadges(progress);
  
  // Mémoriser le handler d'édition
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(progress);
    }
  }, [onEdit, progress]);
  
  return (
    <BaseCard isGolden className="h-full" fullHeight>
      <BaseCard.Accent isGolden />
      <BaseCard.Content className="flex flex-col flex-1 min-h-0">
        {/* Contenu principal */}
        <div className={clsx(
          'flex flex-col flex-1 min-h-0',
          compact ? 'p-3' : 'p-4'
        )}>
          {/* En-tête avec icônes de succès et badges */}
          <div className={clsx(
            'flex items-start justify-between gap-2',
            compact ? 'mb-2' : 'mb-3'
          )}>
            {/* Icônes de célébration */}
            <div className="flex items-center gap-1">
              <span className={compact ? 'text-lg' : 'text-2xl'}>{PROGRESS_EMOJIS.STAR_BRIGHT}</span>
              {!compact && (
                <>
                  <span className="text-xl">{PROGRESS_EMOJIS.TROPHY}</span>
                  <span className="text-xl">{PROGRESS_EMOJIS.THUMBS_UP}</span>
                </>
              )}
            </div>
            
            {/* Badges regroupés en haut à droite */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Badge Ortho/Physique */}
              <Badge className={GOLDEN_BADGE_STYLES.classes}>
                {typeBadge.emoji} {compact ? '' : `${typeBadge.label}`}
              </Badge>
              {/* Badge catégorie d'exercice si disponible */}
              {categoryBadge && (
                <Badge className={GOLDEN_BADGE_STYLES.classes}>
                  {categoryBadge.emoji} {compact ? '' : `${categoryBadge.label}`}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Titre - Plus grand et plus gras, star de la carte */}
          <div className={clsx(
            'flex-1 min-h-0',
            compact ? 'mb-2' : 'mb-3'
          )}>
            <h3 className={clsx(
              GOLDEN_TEXT_STYLES.primary,
              compact ? 'text-sm sm:text-base' : 'text-base sm:text-xl',
              'font-bold leading-tight'
            )}>
              {cleanContent}
            </h3>
            
            {/* Progress tags sous le titre */}
            {tags.length > 0 && (
              <div className={clsx(
                'flex flex-wrap gap-1.5',
                compact ? 'mt-1.5' : 'mt-2'
              )}>
                {tags.map(({ label, emoji }) => (
                  <span
                    key={label}
                    className={clsx(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-lg',
                      GOLDEN_TEXT_STYLES.tag,
                      'text-xs font-medium'
                    )}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Date en bas */}
          {!compact && (
            <div className="mt-auto pt-2 shrink-0">
              <p className={clsx(
                'text-xs',
                GOLDEN_TEXT_STYLES.secondary,
                'font-medium'
              )}>
                {formatVictoryDate(progress.createdAt)}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer avec bouton modifier - toujours en bas */}
        {onEdit && (
          <BaseCard.Footer isGolden className="shrink-0">
            <IconButton
              onClick={handleEdit}
              title="Modifier"
              aria-label="Modifier ce progrès"
            >
              <EditIcon className={`w-4 h-4 ${GOLDEN_TEXT_STYLES.icon}`} />
            </IconButton>
          </BaseCard.Footer>
        )}
      </BaseCard.Content>
    </BaseCard>
  );
}

