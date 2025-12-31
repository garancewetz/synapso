'use client';

import { useRouter } from 'next/navigation';
import type { AphasieItem } from '@/app/types';

interface AphasieItemCardProps {
  item: AphasieItem;
}

/**
 * Composant pour afficher une citation aphasie
 */
export default function AphasieItemCard({ item }: AphasieItemCardProps) {
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/aphasie/edit/${item.id}`);
  };

  return (
    <li className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
      <div className="mb-3 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
        <div className="text-lg md:text-xl font-bold text-gray-800 md:w-1/3">{item.quote}</div>
        <div className="text-gray-700 italic text-sm md:text-base">{item.meaning}</div>
      </div>
      {item.comment && (
        <div className="mb-2 text-xs text-gray-400 italic">{item.comment}</div>
      )}
      <div className="flex items-center">
        {item.date && (
          <div className="text-sm text-gray-600 font-medium">{item.date}</div>
        )}
        <button
          onClick={handleEditClick}
          className="ml-auto cursor-pointer text-xs text-gray-400 hover:text-gray-600"
          aria-label="Modifier la citation"
        >
          Modifier
        </button>
      </div>
    </li>
  );
}

