'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import type { HistoryEntry, Progress } from '@/app/types';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/app/constants/exercice.constants';
import { PROGRESS_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import { Accordion } from '@/app/components/ui';
import { extractProgressTags } from '@/app/utils/progress.utils';
import { useProgressBadges } from '@/app/hooks/useProgressBadges';

type WeekData = {
  weekKey: string;
  label: string;
  entries: HistoryEntry[];
  progress?: Progress[];
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
      {weeks.map(({ weekKey, label, entries, progress = [] }) => (
        <Accordion.Item key={weekKey} value={weekKey}>
          <WeekAccordionTrigger 
            label={label}
            entriesCount={entries.length}
            progress={progress}
          />
          <Accordion.Content>
            <WeekAccordionContent 
              entries={entries}
              progress={progress}
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
  progress: Progress[];
};

function WeekAccordionTrigger({ label, entriesCount, progress }: WeekAccordionTriggerProps) {
  const hasProgress = progress.length > 0;
  
  return (
    <Accordion.Trigger
      icon={NAVIGATION_EMOJIS.FOLDER_CLOSED}
      showChevron
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
        {label}
        {hasProgress && <span className="text-lg">{PROGRESS_EMOJIS.STAR}</span>}
      </h3>
      <p className="text-sm text-gray-500">
        {entriesCount} exercice{entriesCount > 1 ? 's' : ''}
        {hasProgress && (
          <span className="text-amber-600 ml-1">
            · {progress.length} progrès
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
  progress: Progress[];
};

function WeekAccordionContent({ entries, progress }: WeekAccordionContentProps) {
  const hasProgress = progress.length > 0;
  const hasEntries = entries.length > 0;
  
  return (
    <div className="space-y-4">
      {/* Section Progrès */}
      {hasProgress && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
            <span>{PROGRESS_EMOJIS.STAR}</span> Progrès de la semaine
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {progress.map((item) => (
              <ProgressCardCompact key={item.id} progress={item} />
            ))}
          </div>
        </div>
      )}
      
      {/* Section Exercices */}
      {hasEntries && (
        <div className="space-y-2">
          {hasProgress && (
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
// PROGRESS CARD COMPACT
// ============================================================================

type ProgressCardCompactProps = {
  progress: Progress;
};

function ProgressCardCompact({ progress }: ProgressCardCompactProps) {
  const { cleanContent } = useMemo(() => extractProgressTags(progress.content), [progress.content]);
  const { typeBadge, categoryBadge } = useProgressBadges(progress);

  const formattedDate = format(new Date(progress.createdAt), 'EEE d MMM', { locale: fr });

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
      <div className="flex items-start gap-2">
        <span className="text-2xl shrink-0">
          {categoryBadge?.emoji || typeBadge.emoji || progress.emoji || PROGRESS_EMOJIS.STAR}
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

