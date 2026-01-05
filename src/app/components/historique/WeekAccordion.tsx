'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import type { HistoryEntry, Victory } from '@/app/types';
import { BODYPART_ICONS, CATEGORY_CHART_COLORS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { VICTORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { ChevronIcon } from '@/app/components/ui/icons';
import { Badge } from '@/app/components/ui';
import { extractVictoryTags } from '@/app/utils/victory.utils';
import { useVictoryBadges } from '@/app/hooks/useVictoryBadges';

type Props = {
  weekKey: string;
  label: string;
  entries: HistoryEntry[];
  victories?: Victory[];
  isExpanded: boolean;
  onToggle: () => void;
};

export function WeekAccordion({ label, entries, victories = [], isExpanded, onToggle }: Props) {
  const hasVictories = victories.length > 0;
  const hasEntries = entries.length > 0;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* En-tête cliquable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {isExpanded ? NAVIGATION_EMOJIS.FOLDER_OPEN : NAVIGATION_EMOJIS.FOLDER_CLOSED}
          </span>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              {label}
              {hasVictories && <span className="text-lg">{VICTORY_EMOJIS.STAR}</span>}
            </h3>
            <p className="text-sm text-gray-500">
              {entries.length} exercice{entries.length > 1 ? 's' : ''}
              {hasVictories && (
                <span className="text-amber-600 ml-1">
                  · {victories.length} victoire{victories.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        <ChevronIcon 
          direction={isExpanded ? 'up' : 'down'} 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-0' : ''
          }`}
        />
      </button>

      {/* Contenu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
          {/* Section Victoires */}
          {hasVictories && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                <span>{VICTORY_EMOJIS.STAR}</span> Victoires de la semaine
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {victories.map((victory) => (
                  <VictoryCardCompact key={victory.id} victory={victory} />
                ))}
              </div>
            </div>
          )}
          
          {/* Section Exercices */}
          {hasEntries && (
            <div className="space-y-2">
              {hasVictories && (
                <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <span>{CATEGORY_EMOJIS.PHYSIQUE}</span> Exercices réalisés
                </h4>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entries.map((entry) => (
                  <HistoryEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type HistoryEntryCardProps = {
  entry: HistoryEntry;
};

function HistoryEntryCard({ entry }: HistoryEntryCardProps) {
  return (
    <div className="flex bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors overflow-hidden">
      {/* Bande de couleur */}
      <div
        className="w-1.5 shrink-0"
        style={{ 
          backgroundColor: entry.exercice.category 
            ? CATEGORY_CHART_COLORS[entry.exercice.category] 
            : '#6B7280' 
        }}
      />
      
      <div className="flex items-center gap-3 p-3 flex-1">
        {/* Icône catégorie */}
        <span className="text-2xl">
          {entry.exercice.category 
            ? CATEGORY_ICONS[entry.exercice.category]
            : '🏃'}
        </span>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 text-sm truncate">
            {entry.exercice.name}
          </h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {entry.exercice.bodyparts.map((bp) => (
              <span key={bp.id} title={bp.name}>
                <Badge
                  icon={BODYPART_ICONS[bp.name] || '⚪'}
                  className="bg-white text-gray-600 rounded-full px-2 py-0.5"
                >
                  <span className="hidden sm:inline">{bp.name}</span>
                </Badge>
              </span>
            ))}
          </div>
        </div>
      
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {format(new Date(entry.completedAt), "d MMM HH:mm", { locale: fr })}
        </span>
      </div>
    </div>
  );
}

type VictoryCardCompactProps = {
  victory: Victory;
};

function VictoryCardCompact({ victory }: VictoryCardCompactProps) {
  // Extraire le contenu propre (sans tags)
  const { cleanContent } = useMemo(
    () => extractVictoryTags(victory.content),
    [victory.content]
  );
  
  // Calculer les badges via le hook factorisé
  const { typeBadge, categoryBadge } = useVictoryBadges(victory);
  
  return (
    <div className="flex bg-gradient-to-br from-amber-50 via-yellow-50/95 to-amber-100/80 rounded-xl hover:from-amber-100 hover:via-yellow-100/95 hover:to-amber-200/80 transition-colors overflow-hidden border-2 border-amber-400 shadow-md shadow-amber-200/40">
      {/* Bande de couleur */}
      <div
        className="w-1.5 shrink-0"
        style={{ 
          backgroundColor: typeBadge.color
        }}
      />
      
      <div className="flex items-start gap-3 p-3 flex-1 min-w-0">
        {/* Icône de succès */}
        <span className="text-2xl shrink-0">
          {VICTORY_EMOJIS.STAR}
        </span>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-amber-950 text-sm break-words line-clamp-2">
            {cleanContent}
          </h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {/* Badge Ortho/Physique */}
            <Badge
              icon={typeBadge.emoji}
              className="bg-white text-amber-800 border border-amber-300 rounded-full px-2 py-0.5"
            >
              <span className="hidden sm:inline">{typeBadge.label}</span>
            </Badge>
            {/* Badge catégorie d'exercice si disponible */}
            {categoryBadge && (
              <span style={{ borderColor: categoryBadge.color, color: categoryBadge.color }}>
                <Badge
                  icon={categoryBadge.emoji}
                  className="bg-white border rounded-full px-2 py-0.5"
                >
                  <span className="hidden sm:inline">{categoryBadge.label}</span>
                </Badge>
              </span>
            )}
          </div>
        </div>
      
        <span className="text-xs text-amber-600 whitespace-nowrap shrink-0">
          {format(new Date(victory.createdAt), "d MMM HH:mm", { locale: fr })}
        </span>
      </div>
    </div>
  );
}

