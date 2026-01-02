'use client';

import { useMemo, useCallback } from 'react';
import type { Victory } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { IconButton, Badge, BaseCard } from '@/app/components/ui';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { extractVictoryTags } from '@/app/utils/victory.utils';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { GOLDEN_BADGE_STYLES, GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';

type Props = {
  victory: Victory;
  onEdit?: (victory: Victory) => void;
};

/**
 * Carte de victoire individuelle
 * Style doré avec étoile et emoji de catégorie
 */
export function VictoryCard({ victory, onEdit }: Props) {
  const { getJustifyClasses } = useHandPreference();
  
  // Mémoriser l'extraction des tags (calcul coûteux)
  const { cleanContent, tags } = useMemo(
    () => extractVictoryTags(victory.content),
    [victory.content]
  );
  
  // Mémoriser les valeurs dérivées
  const isOrthophonie = useMemo(() => victory.emoji === '🎯', [victory.emoji]);
  const badgeEmoji = useMemo(() => isOrthophonie ? '💬' : '🏋️', [isOrthophonie]);
  const badgeLabel = useMemo(() => isOrthophonie ? 'Ortho' : 'Physique', [isOrthophonie]);
  
  // Mémoriser le handler d'édition
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(victory);
    }
  }, [onEdit, victory]);
  
  return (
    <BaseCard isGolden>
      <BaseCard.Accent isGolden />
      <BaseCard.Content>
        <div className="p-4">
        {/* Étoile et badge en haut à gauche */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-2xl">⭐</span>
          <Badge className={GOLDEN_BADGE_STYLES.classes}>
            {badgeEmoji} {badgeLabel}
          </Badge>
        </div>
        
        {/* Titre */}
        <div className="mb-2">
          <p className={`${GOLDEN_TEXT_STYLES.primary} font-semibold leading-relaxed`}>
            {cleanContent}
          </p>
        </div>
        
        {/* Victory tags sous le titre */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(({ label, emoji }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${GOLDEN_TEXT_STYLES.tag} text-xs font-medium`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        )}
        
        {/* Date */}
        <p className={`text-xs ${GOLDEN_TEXT_STYLES.secondary} mt-2 font-medium`}>
          {formatVictoryDate(victory.createdAt)}
        </p>
        </div>
        {onEdit && (
          <BaseCard.Footer isGolden className={getJustifyClasses()}>
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
