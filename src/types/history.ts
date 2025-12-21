import type { ExerciceCategory } from './exercice';

export interface HistoryEntry {
  id: number;
  completedAt: string;
  exercice: {
    id: number;
    name: string;
    category?: ExerciceCategory;
    bodyparts: Array<{ id: number; name: string; color: string }>;
    equipments: string[];
  };
}
