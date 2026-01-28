export type User = {
  id: number;
  name: string;
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
  hasJournal?: boolean;
};

