import type { HistoryEntry, Progress } from '@/app/types';
import type { ExerciceCategory } from '@/app/types/exercice';

export interface Stats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  byBodypart: Record<string, number>;
  byCategory: Record<ExerciceCategory, number>;
}

export interface HeatmapDay {
  date: Date | null;
  dateKey: string;
  count: number;
  dominantCategory: ExerciceCategory | null;
  secondaryCategory: ExerciceCategory | null;
  allCategories: ExerciceCategory[];
  isToday: boolean;
  isEmpty: boolean;
}

export interface DonutChartItem {
  name: string;
  value: number;
  icon: string;
  color: string;
  [key: string]: string | number;
}

export interface WeekGroup {
  weekKey: string;
  label: string;
  entries: HistoryEntry[];
  progress: Progress[];
}

export type DayExercise = {
  id: number;
  name: string;
  category: ExerciceCategory;
  completedAt: string;
};
