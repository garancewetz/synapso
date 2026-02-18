import { prisma } from '@/app/lib/prisma';

type CreateJournalNoteData = {
  title: string;
  description?: string;
  userId: number;
};

export async function createJournalNote(data: CreateJournalNoteData) {
  const note = await prisma.journalNote.create({
    data: {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      userId: data.userId,
    },
  });

  return note;
}
