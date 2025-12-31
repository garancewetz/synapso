'use client';

import type { Victory } from '@/app/types';
import { EditIcon } from '@/app/components/ui/icons';
import { IconButton } from '@/app/components/ui';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import { cn } from '@/app/utils/cn';

interface VictoryCardProps {
  victory: Victory;
  onEdit?: (victory: Victory) => void;
}

/**
 * Carte de victoire individuelle
 * Style doré avec étoile et emoji de catégorie
 */
export function VictoryCard({ victory, onEdit }: VictoryCardProps) {
  const { getJustifyClasses } = useHandPreference();
  return (
    <div 
      className="bg-gradient-to-br from-amber-50/50 via-white to-yellow-50/50 rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden"
    >
      <div className="flex">
        {/* Bande dorée */}
        <div className="w-2 bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 flex-shrink-0" />
        
        <div className="flex-1">
          {/* Contenu principal */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Étoile + emoji catégorie */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <span className="text-2xl">⭐</span>
                {victory.emoji && (
                  <span className="text-lg opacity-80">{victory.emoji}</span>
                )}
              </div>
              
              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p className="text-amber-900 font-semibold leading-relaxed">
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
            <div className={cn('border-t border-amber-200 bg-amber-100/50 px-4 py-2 flex items-center gap-2', getJustifyClasses())}>
              <IconButton
                onClick={() => onEdit(victory)}
                title="Modifier"
                aria-label="Modifier cette victoire"
              >
                <EditIcon className="w-4 h-4 text-amber-700" />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
