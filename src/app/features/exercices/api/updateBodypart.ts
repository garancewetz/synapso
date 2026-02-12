import { prisma } from '@/app/lib/prisma';

type UpdateBodypartParams = {
  id: number;
  name: string;
};

export async function updateBodypart(params: UpdateBodypartParams) {
  const { id, name } = params;

  const bodypart = await prisma.bodypart.update({
    where: { id },
    data: {
      name,
    },
  });

  return bodypart;
}
