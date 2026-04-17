import { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUserId, getImpersonatedUserId } from '@/app/lib/auth';
import { authUserSelect } from '@/app/lib/auth-shared';

type CheckAuthParams = {
  request: NextRequest;
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

  const rawImpersonatedId = getImpersonatedUserId(request);
  const impersonatedUserId =
    rawImpersonatedId && rawImpersonatedId !== userId ? rawImpersonatedId : null;

  const [user, candidateImpersonatedUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: authUserSelect }),
    impersonatedUserId !== null
      ? prisma.user.findUnique({
          where: { id: impersonatedUserId },
          select: authUserSelect,
        })
      : Promise.resolve(null),
  ]);

  if (!user) {
    return {
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    };
  }

  const isAdmin = user.role === 'ADMIN';
  const impersonatedUser = isAdmin ? candidateImpersonatedUser : null;

  return {
    authenticated: true,
    user,
    isAdmin,
    impersonatedUser,
  };
}
