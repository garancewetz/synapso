import { prisma } from '@/app/lib/prisma';

type DeleteBodypartParams = {
  id: number;
};

export async function deleteBodypart(params: DeleteBodypartParams) {
  const { id } = params;

  await prisma.bodypart.delete({
    where: { id },
  });

  return { message: 'Bodypart supprimé avec succès' };
}
