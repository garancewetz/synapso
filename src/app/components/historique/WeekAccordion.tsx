'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { HistoryEntry, Victory } from '@/app/types';
import { CATEGORY_ICONS, BODYPART_ICONS, CATEGORY_CHART_COLORS } from '@/app/constants/exercice.constants';
import { ChevronIcon } from '@/app/components/ui/icons';
import { VictoryCard } from './VictoryCard';

interface WeekAccordionProps {
  weekKey: string;
  label: string;
  entries: HistoryEntry[];
  victories?: Victory[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function WeekAccordion({ label, entries, victories = [], isExpanded, onToggle }: WeekAccordionProps) {
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
            {isExpanded ? '📂' : '📁'}
          </span>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              {label}
              {hasVictories && <span className="text-lg">⭐</span>}
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
          className="w-5 h-5 text-gray-400"
        />
      </button>

      {/* Contenu */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
          {/* Section Victoires */}
          {hasVictories && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                <span>⭐</span> Victoires de la semaine
              </h4>
              <div className="space-y-2">
                {victories.map((victory) => (
                  <VictoryCard key={victory.id} victory={victory} />
                ))}
              </div>
            </div>
          )}
          
          {/* Section Exercices */}
          {hasEntries && (
            <div className="space-y-2">
              {hasVictories && (
                <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <span>💪</span> Exercices réalisés
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
      )}
    </div>
  );
}

function HistoryEntryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="flex bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors overflow-hidden">
      {/* Bande de couleur */}
      <div
        className="w-1.5 flex-shrink-0"
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
              <span
                key={bp.id}
                className="inline-flex items-center gap-1 text-xs bg-white px-2 py-0.5 rounded-full text-gray-600"
                title={bp.name}
              >
                <span>{BODYPART_ICONS[bp.name] || '⚪'}</span>
                <span className="hidden sm:inline">{bp.name}</span>
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

