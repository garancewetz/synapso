import { prisma } from '@/app/lib/prisma';

type CreateJournalNoteData = {
  content: string;
  title?: string | null;
  date?: Date | null;
  userId: number;
};

export async function createJournalNote(data: CreateJournalNoteData) {
  const note = await prisma.journalNote.create({
    data: {
      content: data.content.trim(),
      title: data.title ? data.title.trim() : null,
      date: data.date || null,
      userId: data.userId,
    },
  });

  return note;
}
