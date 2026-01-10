export interface Progress {
  id: number;
  content: string;
  emoji: string | null;
  userId: number;
  createdAt: string;
}

export interface ProgressInput {
  content: string;
  emoji?: string;
}

