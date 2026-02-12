import { prisma } from '@/app/lib/prisma';
import { verifyPassword, setAuthCookie } from '@/app/lib/auth';

type LoginParams = {
  name: string;
  password: string;
};

export async function login(params: LoginParams) {
  const { name, password } = params;

  const user = await prisma.user.findUnique({
    where: { name: name.trim() },
    select: {
      id: true,
      name: true,
      passwordHash: true,
      role: true,
      resetFrequency: true,
      dominantHand: true,
      hasJournal: true,
      createdAt: true,
    },
  });

  let isValidPassword = false;
  
  if (user) {
    isValidPassword = await verifyPassword(password, user.passwordHash);
  } else {
    const dummyHash = '$2b$10$dummy.hash.that.takes.same.time.as.real.hash';
    await verifyPassword(password, dummyHash);
  }

  if (!user || !isValidPassword) {
    throw new Error('Identifiants incorrects');
  }

  const { passwordHash: _unused, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
