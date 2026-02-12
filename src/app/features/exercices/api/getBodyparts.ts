import { prisma } from '@/app/lib/prisma';

export async function getBodyparts() {
  const bodyparts = await prisma.bodypart.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return bodyparts;
}
