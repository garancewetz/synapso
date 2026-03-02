import { startOfDay, isSameDay } from 'date-fns';
import type { HeatmapDay } from './historique.types';

export function calculateCurrentStreak(heatmapData: HeatmapDay[], referenceDate?: Date): number {
  let streak = 0;
  const today = startOfDay(referenceDate || new Date());

  for (let i = heatmapData.length - 1; i >= 0; i--) {
    const day = heatmapData[i];
    if (day.isEmpty) continue;

    if (day.count > 0) {
      streak++;
    } else if (day.date && !isSameDay(day.date, today)) {
      break;
    }
  }

  return streak;
}
