import { prisma } from '@/app/lib/prisma';

type CreateJournalTaskData = {
  title: string;
  userId: number;
};

export async function createJournalTask(data: CreateJournalTaskData) {
  const task = await prisma.journalTask.create({
    data: {
      title: data.title.trim(),
      userId: data.userId,
    },
  });

  return task;
}
