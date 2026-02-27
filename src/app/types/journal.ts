import type { MediaItem, ExerciceCategory } from './exercice';

export type LinkedExercice = {
  id: number;
  name: string;
  category: ExerciceCategory;
  description?: string;
};

export type JournalNote = {
  id: number;
  title: string;
  description: string;
  date: string | null;
  pinned: boolean;
  validated: boolean;
  validatedAt: string | null;
  media: MediaItem[] | null;
  exercices: LinkedExercice[];
  userId: number;
  createdAt: string;
  updatedAt: string;
};
