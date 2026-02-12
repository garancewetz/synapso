import { prisma } from '@/app/lib/prisma';

type UpdateJournalTaskData = {
  title?: string;
  completed?: boolean;
};

type UpdateJournalTaskParams = {
  taskId: number;
  userId: number;
  data: UpdateJournalTaskData;
};

export async function updateJournalTask(params: UpdateJournalTaskParams) {
  const { taskId, userId, data } = params;

  const existingTask = await prisma.journalTask.findFirst({
    where: {
      id: taskId,
      userId: userId,
    },
  });

  if (!existingTask) {
    throw new Error('Journal task not found');
  }

  const task = await prisma.journalTask.update({
    where: { id: taskId },
    data: {
      title: data.title !== undefined ? data.title.trim() : undefined,
      completed: data.completed !== undefined ? data.completed : undefined,
      completedAt: data.completed !== undefined ? (data.completed ? new Date() : null) : undefined,
    },
  });

  return task;
}
