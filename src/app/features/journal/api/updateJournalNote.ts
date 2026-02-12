import { prisma } from '@/app/lib/prisma';

type UpdateJournalNoteData = {
  content?: string;
  title?: string | null;
  date?: Date | null;
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
      content: data.content !== undefined ? data.content.trim() : undefined,
      title: data.title !== undefined ? (data.title ? data.title.trim() : null) : undefined,
      date: data.date !== undefined ? data.date : undefined,
    },
  });

  return note;
}
