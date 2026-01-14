'use client';

import { AphasieSectionHeader } from '@/app/components/AphasieSectionHeader';
import { AphasieItemCard } from '@/app/components/AphasieItemCard';
import { BackButton } from '@/app/components/ui/BackButton';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { useAphasieCheck } from '@/app/hooks/useAphasieCheck';
import { useAphasieItems } from '@/app/hooks/useAphasieItems';

export const dynamic = 'force-dynamic';

export default function AphasieCitationsPage() {
  const { hasAccess } = useAphasieCheck();
  const { items } = useAphasieItems();

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
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{CATEGORY_EMOJIS.ORTHOPHONIE} Toutes les citations</h1>
            <AphasieSectionHeader
              addHref="/aphasie/add"
              addLabel="Ajouter une citation"
            />
          </div>
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucune citation pour le moment
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(item => (
                <AphasieItemCard key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

