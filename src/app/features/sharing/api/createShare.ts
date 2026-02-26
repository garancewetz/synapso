import { prisma } from '@/app/lib/prisma';

type CreateShareData = {
  exerciceId: number;
  senderId: number;
  receiverId: number;
};

export async function createShare(data: CreateShareData) {
  const { exerciceId, senderId, receiverId } = data;

  // Pas d'auto-partage
  if (senderId === receiverId) {
    throw new Error('Impossible de partager un exercice avec vous-même');
  }

  // Vérifier que l'exercice existe et appartient au sender
  const exercice = await prisma.exercice.findFirst({
    where: { id: exerciceId, userId: senderId },
  });

  if (!exercice) {
    throw new Error('Exercice non trouvé');
  }

  // Vérifier que le receiver existe
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, name: true },
  });

  if (!receiver) {
    throw new Error('Utilisateur destinataire non trouvé');
  }

  // Vérifier qu'il n'y a pas déjà un partage PENDING identique
  const existingPending = await prisma.sharedExercice.findFirst({
    where: {
      exerciceId,
      senderId,
      receiverId,
      status: 'PENDING',
    },
  });

  if (existingPending) {
    throw new Error('Cet exercice est déjà en attente de partage avec cet utilisateur');
  }

  const share = await prisma.sharedExercice.create({
    data: {
      exerciceId,
      senderId,
      receiverId,
    },
    include: {
      receiver: { select: { name: true } },
    },
  });

  return share;
}
