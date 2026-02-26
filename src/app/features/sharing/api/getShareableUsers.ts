import { prisma } from '@/app/lib/prisma';

/**
 * Retourne la liste des utilisateurs avec lesquels on peut partager
 * Exclut l'utilisateur courant (pas d'auto-partage)
 */
export async function getShareableUsers(currentUserId: number) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });

  return users;
}
