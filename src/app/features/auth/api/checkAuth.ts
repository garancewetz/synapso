import { prisma } from '@/app/lib/prisma';
import { getCurrentUserId, getImpersonatedUserId } from '@/app/lib/auth';

type CheckAuthParams = {
  request: Request;
};

export async function checkAuth(params: CheckAuthParams) {
  const { request } = params;
  const userId = getCurrentUserId(request);
  
  if (!userId) {
    return {
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    return {
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    };
  }

  const isAdmin = user.role === 'ADMIN';
  let impersonatedUser = null;

  if (isAdmin) {
    const impersonatedUserId = getImpersonatedUserId(request);
    
    if (impersonatedUserId && impersonatedUserId !== userId) {
      impersonatedUser = await prisma.user.findUnique({
        where: { id: impersonatedUserId },
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
    }
  }

  return {
    authenticated: true,
    user,
    isAdmin,
    impersonatedUser,
  };
}
