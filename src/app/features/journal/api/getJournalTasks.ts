import { prisma } from '@/app/lib/prisma';

type GetJournalTasksParams = {
  userId: number;
};

export async function getJournalTasks(params: GetJournalTasksParams) {
  const { userId } = params;

  const tasks = await prisma.journalTask.findMany({
    where: {
      userId: userId,
    },
    orderBy: [
      { completed: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return tasks;
}
