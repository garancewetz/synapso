export interface Progress {
  id: number;
  content: string;
  emoji: string | null;
  tags: string[];
  userId: number;
  createdAt: string;
}

export interface ProgressInput {
  content: string;
  emoji?: string;
  tags?: string[];
}

