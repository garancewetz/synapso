import { prisma } from '@/app/lib/prisma';
import type { MediaItem } from '@/app/types/exercice';

type CreateJournalNoteData = {
  title: string;
  description?: string;
  media?: MediaItem[];
  exerciceIds?: number[];
  userId: number;
};

export async function createJournalNote(data: CreateJournalNoteData) {
  const note = await prisma.journalNote.create({
    data: {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      media: data.media && data.media.length > 0 ? data.media : undefined,
      userId: data.userId,
      exercices: data.exerciceIds && data.exerciceIds.length > 0
        ? {
            create: data.exerciceIds.map((exerciceId) => ({
              exerciceId,
            })),
          }
        : undefined,
    },
    include: {
      exercices: {
        include: {
          exercice: {
            select: { id: true, name: true, category: true },
          },
        },
      },
    },
  });

  return {
    ...note,
    exercices: note.exercices.map((je) => ({
      id: je.exercice.id,
      name: je.exercice.name,
      category: je.exercice.category,
    })),
  };
}
