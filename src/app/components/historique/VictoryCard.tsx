'use client';

import type { Victory } from '@/app/types';
import { CloseIcon } from '@/app/components/ui/icons';
import { getVictoryGradient } from '@/app/constants/victory.constants';
import { formatVictoryDate } from '@/app/utils/date.utils';

interface VictoryCardProps {
  victory: Victory;
  onDelete?: (id: number) => void;
  showDelete?: boolean;
}

/**
 * Carte de victoire individuelle
 * Affiche une victoire avec sa bande de couleur, son emoji et sa date
 */
export function VictoryCard({ victory, onDelete, showDelete = false }: VictoryCardProps) {
  const gradientColor = getVictoryGradient(victory.emoji);

  return (
    <div 
      className="group bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex">
        {/* Bande de couleur (selon la catégorie) */}
        <div className={`w-1.5 bg-gradient-to-b ${gradientColor} flex-shrink-0`} />
        
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            {/* Emoji */}
            <span className="text-2xl flex-shrink-0 mt-0.5">
              {victory.emoji || '⭐'}
            </span>
            
            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium leading-relaxed">
                {victory.content}
              </p>
              <p className="text-xs text-amber-600 mt-2 font-medium">
                {formatVictoryDate(victory.createdAt)}
              </p>
            </div>

            {/* Bouton supprimer */}
            {showDelete && onDelete && (
              <button
                onClick={() => onDelete(victory.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                aria-label="Supprimer cette victoire"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
