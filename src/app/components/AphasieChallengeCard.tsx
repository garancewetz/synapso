'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { BaseCard, CompleteButton, IconButton, Badge } from '@/app/components/ui';
import { EditIcon } from '@/app/components/ui/icons';
import { GOLDEN_BADGE_STYLES, GOLDEN_TEXT_STYLES, APHASIE_COLORS } from '@/app/constants/card.constants';
import type { AphasieChallenge } from '@/app/types';

type Props = {
  challenge: AphasieChallenge;
  onMasteredToggle: (id: number, currentMastered: boolean) => Promise<void>;
  isUpdating: boolean;
};

/**
 * Composant pour afficher un exercice aphasie
 * Bande jaune solaire par défaut, passe en golden (style VictoryCard) quand maîtrisé
 */
export default function AphasieChallengeCard({ 
  challenge, 
  onMasteredToggle, 
  isUpdating 
}: Props) {
  const isMastered = challenge.mastered;
  
  const handleMasteredClick = useCallback(() => {
    onMasteredToggle(challenge.id, challenge.mastered);
  }, [onMasteredToggle, challenge.id, challenge.mastered]);

  return (
    <BaseCard
      as="li"
      isGolden={isMastered}
    >
      <BaseCard.Accent 
        color={isMastered ? undefined : APHASIE_COLORS.SOLAR_YELLOW}
        isGolden={isMastered}
      />
      <BaseCard.Content>
        <div className={clsx('p-4', isMastered ? '' : 'md:p-5')}>
        {isMastered ? (
          <>
            {/* Style VictoryCard : étoile et badge en haut */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <Badge className={GOLDEN_BADGE_STYLES.classes}>
                💬 Ortho
              </Badge>
            </div>
            
            {/* Titre */}
            <div className="mb-2">
              <p className={clsx(GOLDEN_TEXT_STYLES.primary, 'font-semibold leading-relaxed')}>
                {challenge.text}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-start gap-3">
            {/* Contenu simple pour non maîtrisé */}
            <div className="flex-1 min-w-0">
              <div className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
                {challenge.text}
              </div>
            </div>
          </div>
        )}
        </div>
        <BaseCard.Footer isGolden={isMastered}>
          <Link href={`/aphasie/challenges/edit/${challenge.id}`}>
            <IconButton
              title="Modifier"
              aria-label="Modifier l'exercice"
            >
              <EditIcon className={clsx('w-4 h-4', isMastered && GOLDEN_TEXT_STYLES.icon)} />
            </IconButton>
          </Link>
          <CompleteButton
            onClick={handleMasteredClick}
            isCompleted={challenge.mastered}
            variant="challenge"
            isLoading={isUpdating}
          />
        </BaseCard.Footer>
      </BaseCard.Content>
    </BaseCard>
  );
}

