import { prisma } from '@/app/lib/prisma';

type DeleteJournalNoteParams = {
  noteId: number;
  userId: number;
};

export async function deleteJournalNote(params: DeleteJournalNoteParams) {
  const { noteId, userId } = params;

  const existingNote = await prisma.journalNote.findFirst({
    where: {
      id: noteId,
      userId: userId,
    },
  });

  if (!existingNote) {
    throw new Error('Journal note not found');
  }

  await prisma.journalNote.delete({
    where: { id: noteId },
  });
}
