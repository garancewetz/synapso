export interface HistoryEntry {
  id: number;
  completedAt: string;
  exercice: {
    id: number;
    name: string;
    bodyparts: Array<{ id: number; name: string; color: string }>;
    equipments: string[];
  };
}

