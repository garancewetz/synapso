export interface AphasieItem {
  id: number;
  quote: string;
  meaning: string;
  date: string | null;
  comment: string | null;
  userId: number;
  createdAt: string;
}

export interface AphasieChallenge {
  id: number;
  text: string;
  mastered: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
