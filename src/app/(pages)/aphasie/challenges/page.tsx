'use client';

import Link from 'next/link';
import { ChevronIcon } from '@/app/components/ui/icons';
import AphasieSectionHeader from '@/app/components/AphasieSectionHeader';
import AphasieChallengesList from '@/app/components/AphasieChallengesList';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';

export const dynamic = 'force-dynamic';

export default function AphasieChallengesPage() {
  const { hasAccess } = useAphasieCheck();

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-20">
      {/* Bouton retour page aphasie */}
      <div className="px-3 sm:px-6 mb-2">
        <Link 
          href="/aphasie"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronIcon direction="left" className="w-5 h-5" />
          <span>💬 Journal d&apos;aphasie</span>
        </Link>
      </div>

      <div className="p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">🎯 Tous les challenges</h1>
            <AphasieSectionHeader
              addHref="/aphasie/challenges/add"
              addLabel="Ajouter un challenge"
            />
          </div>
          <AphasieChallengesList showViewAll={true} />
        </div>
      </div>
    </div>
  );
}

