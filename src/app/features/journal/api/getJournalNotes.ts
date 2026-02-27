import { prisma } from '@/app/lib/prisma';

type GetJournalNotesParams = {
  userId: number;
};

export async function getJournalNotes(params: GetJournalNotesParams) {
  const { userId } = params;

  const notes = await prisma.journalNote.findMany({
    where: {
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
    orderBy: { createdAt: 'desc' },
  });

  return notes.map((note) => ({
    ...note,
    exercices: note.exercices.map((je) => ({
      id: je.exercice.id,
      name: je.exercice.name,
      category: je.exercice.category,
      description: je.exercice.descriptionText,
    })),
  }));
}
