import { prisma } from '@/app/lib/prisma';
import { hashPassword, verifyPassword } from '@/app/lib/auth';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

type UpdateUserPasswordParams = {
  userId: number;
  currentPassword: string;
  newPassword: string;
};

export async function updateUserPassword(params: UpdateUserPasswordParams) {
  const { userId, currentPassword, newPassword } = params;

  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new Error('Le mot de passe actuel est obligatoire');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    throw new Error('Le nouveau mot de passe est obligatoire');
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
  }

  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Le nouveau mot de passe ne peut pas dépasser ${MAX_PASSWORD_LENGTH} caractères`);
  }

  if (currentPassword === newPassword) {
    throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Mot de passe actuel incorrect');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return {
    success: true,
    message: 'Mot de passe modifié avec succès',
  };
}
