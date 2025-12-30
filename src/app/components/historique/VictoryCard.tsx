'use client';

import type { Victory } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { IconButton } from '@/app/components/ui';
import { getVictoryGradient } from '@/app/constants/victory.constants';
import { formatVictoryDate } from '@/app/utils/date.utils';

interface VictoryCardProps {
  victory: Victory;
  onEdit?: (victory: Victory) => void;
}

/**
 * Carte de victoire individuelle
 * Affiche une victoire avec sa bande de couleur, son emoji et sa date
 */
export function VictoryCard({ victory, onEdit }: VictoryCardProps) {
  const gradientColor = getVictoryGradient(victory.emoji);

  return (
    <div 
      className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden"
    >
      <div className="flex">
        {/* Bande de couleur (selon la catégorie) */}
        <div className={`w-1.5 bg-gradient-to-b ${gradientColor} flex-shrink-0`} />
        
        <div className="flex-1">
          {/* Contenu principal */}
          <div className="p-4">
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
            </div>
          </div>

          {/* Footer avec bouton modifier */}
          {onEdit && (
            <div className="border-t border-amber-100 bg-amber-50/50 px-4 py-2 flex items-center gap-2">
              <IconButton
                onClick={() => onEdit(victory)}
                title="Modifier"
                aria-label="Modifier cette victoire"
              >
                <EditIcon className="w-4 h-4" />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
