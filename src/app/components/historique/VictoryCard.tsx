'use client';

import { useMemo, useCallback } from 'react';
import type { Victory } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { IconButton, Badge, BaseCard } from '@/app/components/ui';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { extractVictoryTags } from '@/app/utils/victory.utils';
import { useVictoryBadges } from '@/app/hooks/useVictoryBadges';
import { GOLDEN_BADGE_STYLES, GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';
import { VICTORY_EMOJIS } from '@/app/constants/emoji.constants';
import clsx from 'clsx';

type Props = {
  victory: Victory;
  onEdit?: (victory: Victory) => void;
};

/**
 * Carte de victoire individuelle
 * Style doré avec étoile et emoji de catégorie
 */
export function VictoryCard({ victory, onEdit }: Props) {
  // Mémoriser l'extraction des tags (calcul coûteux)
  const { cleanContent, tags } = useMemo(
    () => extractVictoryTags(victory.content),
    [victory.content]
  );
  
  // Calculer les badges via le hook factorisé
  const { typeBadge, categoryBadge } = useVictoryBadges(victory);
  
  // Mémoriser le handler d'édition
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(victory);
    }
  }, [onEdit, victory]);
  
  return (
    <BaseCard isGolden className="h-full" fullHeight>
      <BaseCard.Accent isGolden />
      <BaseCard.Content className="flex flex-col flex-1 min-h-0">
        {/* Contenu principal */}
        <div className="p-4 flex flex-col flex-1 min-h-0">
          {/* En-tête avec icônes de succès et badges */}
          <div className="flex items-start justify-between gap-3 mb-3">
            {/* Icônes de célébration */}
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">{VICTORY_EMOJIS.STAR_BRIGHT}</span>
              <span className="text-xl">{VICTORY_EMOJIS.TROPHY}</span>
              <span className="text-xl">{VICTORY_EMOJIS.THUMBS_UP}</span>
            </div>
            
            {/* Badges regroupés en haut à droite */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Badge Ortho/Physique */}
              <Badge className={GOLDEN_BADGE_STYLES.classes}>
                {typeBadge.emoji} {typeBadge.label}
              </Badge>
              {/* Badge catégorie d'exercice si disponible */}
              {categoryBadge && (
                <Badge className={GOLDEN_BADGE_STYLES.classes}>
                  {categoryBadge.emoji} {categoryBadge.label}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Titre - Plus grand et plus gras, star de la carte */}
          <div className="mb-3 flex-1 min-h-0">
            <h3 className={clsx(
              GOLDEN_TEXT_STYLES.primary,
              ' sm:text-xl font-bold leading-tight'
            )}>
              {cleanContent}
            </h3>
            
            {/* Victory tags sous le titre */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
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
          <div className="mt-auto pt-2 shrink-0">
            <p className={clsx(
              'text-xs',
              GOLDEN_TEXT_STYLES.secondary,
              'font-medium'
            )}>
              {formatVictoryDate(victory.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Footer avec bouton modifier - toujours en bas */}
        {onEdit && (
          <BaseCard.Footer isGolden className="shrink-0">
            <IconButton
              onClick={handleEdit}
              title="Modifier"
              aria-label="Modifier cette victoire"
            >
              <EditIcon className={`w-4 h-4 ${GOLDEN_TEXT_STYLES.icon}`} />
            </IconButton>
          </BaseCard.Footer>
        )}
      </BaseCard.Content>
    </BaseCard>
  );
}
