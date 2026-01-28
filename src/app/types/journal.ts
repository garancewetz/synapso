export type JournalTask = {
  id: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type JournalNote = {
  id: number;
  content: string;
  title: string | null;
  date: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};
