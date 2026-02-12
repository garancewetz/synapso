import { prisma } from '@/app/lib/prisma';

type GetBodypartParams = {
  id: number;
};

export async function getBodypart(params: GetBodypartParams) {
  const { id } = params;

  const bodypart = await prisma.bodypart.findUnique({
    where: { id },
  });

  return bodypart;
}
