export type JournalNote = {
  id: number;
  title: string;
  description: string;
  date: string | null;
  pinned: boolean;
  validated: boolean;
  validatedAt: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};
