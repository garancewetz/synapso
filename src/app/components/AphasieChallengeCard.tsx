'use client';

import { useCallback, memo } from 'react';
import { TouchLink } from '@/app/components/TouchLink';
import { BaseCard, CompleteButton, Button, Badge } from '@/app/components/ui';
import { SparklesIcon } from '@/app/components/ui/icons';
import { EditIcon } from '@/app/components/ui/icons';
import { APHASIE_COLORS } from '@/app/constants/card.constants';
import type { AphasieChallenge } from '@/app/types';

type Props = {
  challenge: AphasieChallenge;
  onMasteredToggle: (id: number, currentMastered: boolean) => Promise<void>;
  isUpdating: boolean;
};

/**
 * Composant pour afficher un exercice aphasie
 * Bande jaune solaire par défaut, badge "Maîtrisé" en vert quand maîtrisé
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
const AphasieChallengeCard = memo(function AphasieChallengeCard({ 
  challenge, 
  onMasteredToggle, 
  isUpdating 
}: Props) {
  const isMastered = challenge.mastered;
  
  const handleMasteredClick = useCallback(() => {
    onMasteredToggle(challenge.id, challenge.mastered);
  }, [onMasteredToggle, challenge.id, challenge.mastered]);

  return (
    <BaseCard as="li">
      <BaseCard.Accent color={APHASIE_COLORS.SOLAR_YELLOW} />
      <BaseCard.Content>
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-base md:text-lg font-semibold text-gray-800 leading-tight">
                {challenge.text}
              </div>
            </div>
            {/* Badge maîtrisé */}
            {isMastered && (
              <Badge 
                variant="mastered"
                icon={<SparklesIcon className="w-3.5 h-3.5" />}
              >
                Maîtrisé
              </Badge>
            )}
          </div>
        </div>
        <BaseCard.Footer>
          <TouchLink href={`/aphasie/exercices/edit/${challenge.id}`}>
            <Button
              iconOnly
              title="Modifier"
              aria-label="Modifier l'exercice"
            >
              <EditIcon className="w-4 h-4" />
            </Button>
          </TouchLink>
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
});

export { AphasieChallengeCard };

