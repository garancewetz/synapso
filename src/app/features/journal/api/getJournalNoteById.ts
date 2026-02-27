import { prisma } from '@/app/lib/prisma';

type GetJournalNoteByIdParams = {
  noteId: number;
  userId: number;
};

export async function getJournalNoteById(params: GetJournalNoteByIdParams) {
  const { noteId, userId } = params;

  const note = await prisma.journalNote.findFirst({
    where: {
      id: noteId,
      userId: userId,
    },
    include: {
      exercices: {
        include: {
          exercice: {
            select: { id: true, name: true, category: true, descriptionText: true },
          },
        },
      },
    },
  });

  if (!note) {
    throw new Error('Journal note not found');
  }

  return {
    ...note,
    exercices: note.exercices.map((je) => ({
      id: je.exercice.id,
      name: je.exercice.name,
      category: je.exercice.category,
      description: je.exercice.descriptionText,
    })),
  };
}
