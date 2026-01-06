'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import type { HistoryEntry, Victory } from '@/app/types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { VICTORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { Accordion } from '@/app/components/ui';
import { extractVictoryTags } from '@/app/utils/victory.utils';
import { useVictoryBadges } from '@/app/hooks/useVictoryBadges';

type WeekData = {
  weekKey: string;
  label: string;
  entries: HistoryEntry[];
  victories?: Victory[];
};

type Props = {
  weeks: WeekData[];
  /** Items ouverts par défaut (ex: ['current']) */
  defaultExpanded?: string[];
};

/**
 * Liste d'accordéons pour afficher l'historique par semaine
 * Utilise le composant Accordion générique avec compound pattern
 */
export function WeekAccordionList({ weeks, defaultExpanded = ['current'] }: Props) {
  return (
    <Accordion multiple defaultValue={defaultExpanded}>
      {weeks.map(({ weekKey, label, entries, victories = [] }) => (
        <Accordion.Item key={weekKey} value={weekKey}>
          <WeekAccordionTrigger 
            label={label}
            entriesCount={entries.length}
            victories={victories}
          />
          <Accordion.Content>
            <WeekAccordionContent 
              entries={entries}
              victories={victories}
            />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

// ============================================================================
// TRIGGER (Header)
// ============================================================================

type WeekAccordionTriggerProps = {
  label: string;
  entriesCount: number;
  victories: Victory[];
};

function WeekAccordionTrigger({ label, entriesCount, victories }: WeekAccordionTriggerProps) {
  const hasVictories = victories.length > 0;
  
  return (
    <Accordion.Trigger
      icon={NAVIGATION_EMOJIS.FOLDER_CLOSED}
      showChevron
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
        {label}
        {hasVictories && <span className="text-lg">{VICTORY_EMOJIS.STAR}</span>}
      </h3>
      <p className="text-sm text-gray-500">
        {entriesCount} exercice{entriesCount > 1 ? 's' : ''}
        {hasVictories && (
          <span className="text-amber-600 ml-1">
            · {victories.length} victoire{victories.length > 1 ? 's' : ''}
          </span>
        )}
      </p>
    </Accordion.Trigger>
  );
}

// ============================================================================
// CONTENT (Body)
// ============================================================================

type WeekAccordionContentProps = {
  entries: HistoryEntry[];
  victories: Victory[];
};

function WeekAccordionContent({ entries, victories }: WeekAccordionContentProps) {
  const hasVictories = victories.length > 0;
  const hasEntries = entries.length > 0;
  
  return (
    <div className="space-y-4">
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
  );
}

// ============================================================================
// VICTORY CARD COMPACT
// ============================================================================

type VictoryCardCompactProps = {
  victory: Victory;
};

function VictoryCardCompact({ victory }: VictoryCardCompactProps) {
  const { cleanContent } = useMemo(() => extractVictoryTags(victory.content), [victory.content]);
  const { typeBadge, categoryBadge } = useVictoryBadges(victory);

  const formattedDate = format(new Date(victory.createdAt), 'EEE d MMM', { locale: fr });

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
      <div className="flex items-start gap-2">
        <span className="text-2xl shrink-0">
          {categoryBadge?.emoji || typeBadge.emoji || victory.emoji || VICTORY_EMOJIS.STAR}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900 mb-1 line-clamp-2">
            {cleanContent}
          </p>
          <p className="text-xs text-amber-700 opacity-75">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HISTORY ENTRY CARD
// ============================================================================

type HistoryEntryCardProps = {
  entry: HistoryEntry;
};

function HistoryEntryCard({ entry }: HistoryEntryCardProps) {
  const category = entry.exercice.category;
  const categoryColors = category ? CATEGORY_COLORS[category] : null;
  const categoryIcon = category ? CATEGORY_ICONS[category] : '💪';
  const bodypart = entry.exercice.bodyparts[0]?.name;
  const formattedDate = format(new Date(entry.completedAt), 'EEE d MMM', { locale: fr });

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-3 p-3">
        {/* Badge icône avec fond coloré */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryColors?.iconBg || 'bg-gray-100'}`}>
          <span className="text-lg">{categoryIcon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
            {entry.exercice.name}
          </p>
          <p className="text-xs text-gray-400">
            {bodypart && <span>{bodypart} · </span>}
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}

