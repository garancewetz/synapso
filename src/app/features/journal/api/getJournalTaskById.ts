import { prisma } from '@/app/lib/prisma';

type GetJournalTaskByIdParams = {
  taskId: number;
  userId: number;
};

export async function getJournalTaskById(params: GetJournalTaskByIdParams) {
  const { taskId, userId } = params;

  const task = await prisma.journalTask.findFirst({
    where: {
      id: taskId,
      userId: userId,
    },
  });

  if (!task) {
    throw new Error('Journal task not found');
  }

  return task;
}
