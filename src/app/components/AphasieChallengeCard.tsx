'use client';

import { useRouter } from 'next/navigation';
import { CompleteButton } from '@/app/components/ui';
import { EditIcon } from '@/app/components/ui/icons';
import { IconButton } from '@/app/components/ui';
import type { AphasieChallenge } from '@/app/types';

interface AphasieChallengeCardProps {
  challenge: AphasieChallenge;
  onMasteredToggle: (id: number, currentMastered: boolean) => Promise<void>;
  isUpdating: boolean;
}

/**
 * Composant pour afficher un challenge aphasie
 */
export default function AphasieChallengeCard({ 
  challenge, 
  onMasteredToggle, 
  isUpdating 
}: AphasieChallengeCardProps) {
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/aphasie/challenges/edit/${challenge.id}`);
  };

  const handleMasteredClick = () => {
    onMasteredToggle(challenge.id, challenge.mastered);
  };

  return (
    <li className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-800">{challenge.text}</div>
        </div>
      </div>
      {/* Footer avec boutons d'action */}
      <div className="border-t border-gray-100 bg-gray-50/70 px-4 py-3 flex items-center gap-2">
        <IconButton
          onClick={handleEditClick}
          title="Modifier"
          aria-label="Modifier le challenge"
        >
          <EditIcon className="w-4 h-4" />
        </IconButton>
        <CompleteButton
          onClick={handleMasteredClick}
          isCompleted={challenge.mastered}
          variant="challenge"
          isLoading={isUpdating}
        />
      </div>
    </li>
  );
}

