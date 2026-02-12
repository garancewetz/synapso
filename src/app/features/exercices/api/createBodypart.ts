import { prisma } from '@/app/lib/prisma';

type CreateBodypartParams = {
  name: string;
};

export async function createBodypart(params: CreateBodypartParams) {
  const { name } = params;

  if (!name) {
    throw new Error('Le nom est requis');
  }

  const bodypart = await prisma.bodypart.create({
    data: {
      name,
    },
  });

  return bodypart;
}
