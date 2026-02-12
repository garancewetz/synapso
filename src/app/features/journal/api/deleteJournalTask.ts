import { prisma } from '@/app/lib/prisma';

type DeleteJournalTaskParams = {
  taskId: number;
  userId: number;
};

export async function deleteJournalTask(params: DeleteJournalTaskParams) {
  const { taskId, userId } = params;

  const existingTask = await prisma.journalTask.findFirst({
    where: {
      id: taskId,
      userId: userId,
    },
  });

  if (!existingTask) {
    throw new Error('Journal task not found');
  }

  await prisma.journalTask.delete({
    where: { id: taskId },
  });
}
