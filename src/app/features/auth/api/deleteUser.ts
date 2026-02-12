import { prisma } from '@/app/lib/prisma';

type DeleteUserParams = {
  userId: number;
};

export async function deleteUser(params: DeleteUserParams) {
  const { userId } = params;

  const userCount = await prisma.user.count();
  if (userCount <= 1) {
    throw new Error('Impossible de supprimer le dernier utilisateur');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === 'ADMIN') {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new Error('Impossible de supprimer le dernier administrateur');
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
}
