import type { HistoryEntry, Progress } from '@/app/types';
import { startOfWeek, isBefore, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getDateKey } from '@/app/utils/date.utils';
import type { WeekGroup } from './historique.types';

export function groupHistoryByWeek(history: HistoryEntry[], progress: Progress[] = []): WeekGroup[] {
  const grouped: Record<string, { label: string; entries: HistoryEntry[]; progress: Progress[] }> = {};
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  const activeProgress = progress.filter(p =>
    p.id != null &&
    p.id > 0 &&
    p.content &&
    p.content.trim().length > 0
  );

  const getWeekInfo = (date: Date): { weekKey: string; weekLabel: string } => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });

    if (!isBefore(date, thisWeekStart)) {
      return { weekKey: 'current', weekLabel: 'Cette semaine' };
    }
    return {
      weekKey: getDateKey(weekStart) ?? '',
      weekLabel: `Semaine du ${format(weekStart, 'd MMMM', { locale: fr })}`,
    };
  };

  const ensureGroup = (weekKey: string, weekLabel: string) => {
    if (!grouped[weekKey]) {
      grouped[weekKey] = { label: weekLabel, entries: [], progress: [] };
    }
  };

  history.forEach(entry => {
    const entryDate = new Date(entry.completedAt);
    const { weekKey, weekLabel } = getWeekInfo(entryDate);
    ensureGroup(weekKey, weekLabel);
    grouped[weekKey].entries.push(entry);
  });

  activeProgress.forEach(item => {
    const progressDate = new Date(item.createdAt);
    const { weekKey, weekLabel } = getWeekInfo(progressDate);
    ensureGroup(weekKey, weekLabel);
    grouped[weekKey].progress.push(item);
  });

  return Object.entries(grouped)
    .sort(([keyA], [keyB]) => {
      if (keyA === 'current') return -1;
      if (keyB === 'current') return 1;
      return keyB.localeCompare(keyA);
    })
    .map(([weekKey, { label, entries, progress: weekProgress }]) => ({
      weekKey,
      label,
      entries,
      progress: weekProgress,
    }));
}

export function getFirstDateFromProgressAndHistory(
  progress: Progress[],
  history: HistoryEntry[]
): Date | null {
  const sortedProgress = [...progress].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const sortedHistory = [...history].sort((a, b) =>
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  if (sortedProgress.length > 0 && sortedHistory.length > 0) {
    const firstProgressDate = new Date(sortedProgress[0].createdAt);
    const firstExerciseDate = new Date(sortedHistory[0].completedAt);
    return firstProgressDate < firstExerciseDate ? firstProgressDate : firstExerciseDate;
  }
  if (sortedHistory.length > 0) {
    return new Date(sortedHistory[0].completedAt);
  }
  if (sortedProgress.length > 0) {
    return new Date(sortedProgress[0].createdAt);
  }
  return null;
}
