'use client';

import type { Victory } from '@/app/types';
import { VICTORY_EMOJIS } from '@/app/constants/emoji.constants';
import { formatTime } from '@/app/utils/date.utils';
import { useVictoryBadges } from '@/app/hooks/useVictoryBadges';

type Props = {
  victory: Victory;
};

/**
 * Carte de victoire ultra-compacte pour la modale de détail du jour
 * Style similaire aux cartes d'exercices : une seule ligne, pas de modification
 */
export function VictoryCardCompact({ victory }: Props) {
  const { typeBadge, categoryBadge } = useVictoryBadges(victory);
  
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-yellow-200">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Badge icône doré */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-400 to-yellow-500">
          <span className="text-lg flex items-center justify-center">{VICTORY_EMOJIS.STAR_BRIGHT}</span>
        </div>
        
        {/* Contenu de la victoire */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {victory.content}
          </p>
          
          {/* Badges discrets sous le contenu */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-medium text-amber-700">
              {typeBadge.emoji}
            </span>
            {categoryBadge && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-[10px] font-medium text-amber-700">
                  {categoryBadge.emoji} {categoryBadge.label}
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Heure */}
        <span className="text-xs text-gray-500 shrink-0 bg-white/80 px-2 py-1 rounded-lg">
          {formatTime(victory.createdAt)}
        </span>
      </div>
    </div>
  );
}

