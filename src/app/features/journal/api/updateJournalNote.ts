import { prisma } from '@/app/lib/prisma';

type UpdateJournalNoteData = {
  title?: string;
  description?: string;
};

type UpdateJournalNoteParams = {
  noteId: number;
  userId: number;
  data: UpdateJournalNoteData;
};

export async function updateJournalNote(params: UpdateJournalNoteParams) {
  const { noteId, userId, data } = params;

  const existingNote = await prisma.journalNote.findFirst({
    where: {
      id: noteId,
      userId: userId,
    },
  });

  if (!existingNote) {
    throw new Error('Journal note not found');
  }

  const note = await prisma.journalNote.update({
    where: { id: noteId },
    data: {
      title: data.title !== undefined ? data.title.trim() : undefined,
      description: data.description !== undefined ? data.description.trim() : undefined,
    },
  });

  return note;
}
