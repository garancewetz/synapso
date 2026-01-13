'use client';

import { AphasieSectionHeader } from '@/app/components/AphasieSectionHeader';
import { AphasieChallengesList } from '@/app/components/AphasieChallengesList';
import { BackButton } from '@/app/components/BackButton';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';

export const dynamic = 'force-dynamic';

export default function AphasieExercicesPage() {
  const { hasAccess } = useAphasieCheck();

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour page aphasie */}
      <BackButton 
        backHref="/aphasie" 
        className="mb-4" 
        buttonClassName="py-3"
      />

      <div className="px-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">🎯 Tous les exercices</h1>
            <AphasieSectionHeader
              addHref="/aphasie/exercices/add"
              addLabel="Ajouter un exercice"
            />
          </div>
          <AphasieChallengesList showViewAll={true} />
        </div>
      </div>
    </div>
  );
}

