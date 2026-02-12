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
  });

  if (!note) {
    throw new Error('Journal note not found');
  }

  return note;
}
