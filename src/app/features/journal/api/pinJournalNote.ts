import { prisma } from '@/app/lib/prisma';

type PinJournalNoteParams = {
  noteId: number;
  userId: number;
};

export async function pinJournalNote(params: PinJournalNoteParams) {
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

  const updatedNote = await prisma.journalNote.update({
    where: { id: noteId },
    data: {
      pinned: !note.pinned,
    },
  });

  return { pinned: updatedNote.pinned };
}
