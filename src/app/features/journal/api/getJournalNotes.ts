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
    orderBy: { createdAt: 'desc' },
  });

  return notes;
}
