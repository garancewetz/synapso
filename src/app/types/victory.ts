export interface Victory {
  id: number;
  content: string;
  emoji: string | null;
  userId: number;
  createdAt: string;
}

export interface VictoryInput {
  content: string;
  emoji?: string;
}

