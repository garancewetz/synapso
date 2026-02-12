import { prisma } from '@/app/lib/prisma';

type UpdateUserParams = {
  userId: number;
  name?: string;
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
  hasJournal?: boolean;
};

export async function updateUser(params: UpdateUserParams) {
  const { userId, name, resetFrequency, dominantHand, hasJournal } = params;

  if (resetFrequency && !['DAILY', 'WEEKLY'].includes(resetFrequency)) {
    throw new Error('resetFrequency doit être DAILY ou WEEKLY');
  }

  if (dominantHand && !['LEFT', 'RIGHT'].includes(dominantHand)) {
    throw new Error('dominantHand doit être LEFT ou RIGHT');
  }

  if (name !== undefined && !name.trim()) {
    throw new Error('Le nom ne peut pas être vide');
  }

  if (name && name.trim().includes(' ')) {
    throw new Error('Le nom ne peut pas contenir d\'espaces');
  }

  if (name) {
    const trimmedName = name.trim();
    const existingUser = await prisma.user.findFirst({
      where: {
        name: trimmedName,
        id: { not: userId },
      },
    });
    if (existingUser) {
      throw new Error('Ce nom est déjà utilisé par un autre utilisateur');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name: name.trim() }),
      ...(resetFrequency && { resetFrequency }),
      ...(dominantHand && { dominantHand }),
      ...(hasJournal !== undefined && { hasJournal }),
    },
    select: {
      id: true,
      name: true,
      role: true,
      resetFrequency: true,
      dominantHand: true,
      hasJournal: true,
      createdAt: true,
    },
  });

  return user;
}
