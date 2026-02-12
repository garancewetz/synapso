import { prisma } from '@/app/lib/prisma';

type PinExerciceParams = {
  exerciceId: number;
  userId: number;
};

export async function pinExercice(params: PinExerciceParams) {
  const { exerciceId, userId } = params;

  const exercice = await prisma.exercice.findFirst({
    where: {
      id: exerciceId,
      userId: userId,
    },
  });

  if (!exercice) {
    throw new Error('Exercice non trouvé');
  }

  const updatedExercice = await prisma.exercice.update({
    where: { id: exerciceId },
    data: {
      pinned: !exercice.pinned,
    },
  });

  return { pinned: updatedExercice.pinned };
}
