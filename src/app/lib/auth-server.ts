import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import {
  AUTH_COOKIE_NAME,
  IMPERSONATE_COOKIE_NAME,
  authUserSelect,
  readUserIdFromCookieValue,
} from './auth-shared';

type ServerUser = {
  id: number;
  name: string;
  role: 'USER' | 'ADMIN';
  resetFrequency?: 'DAILY' | 'WEEKLY';
  dominantHand?: 'LEFT' | 'RIGHT';
  hasJournal?: boolean;
  createdAt?: string;
};

export type InitialAuthData = {
  authenticated: boolean;
  user: ServerUser | null;
  isAdmin: boolean;
  impersonatedUser: ServerUser | null;
};

type PrismaUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

function serializeUser(user: PrismaUser): ServerUser {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    resetFrequency: user.resetFrequency ?? undefined,
    dominantHand: user.dominantHand ?? undefined,
    hasJournal: user.hasJournal ?? undefined,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
  };
}

const UNAUTHENTICATED: InitialAuthData = {
  authenticated: false,
  user: null,
  isAdmin: false,
  impersonatedUser: null,
};

export const getInitialAuthData = cache(async (): Promise<InitialAuthData> => {
  const cookieStore = await cookies();

  const userId = readUserIdFromCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!userId) return UNAUTHENTICATED;

  const rawImpersonatedId = readUserIdFromCookieValue(
    cookieStore.get(IMPERSONATE_COOKIE_NAME)?.value
  );
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

  if (!user) return UNAUTHENTICATED;

  const isAdmin = user.role === 'ADMIN';
  const impersonatedUser =
    isAdmin && candidateImpersonatedUser ? candidateImpersonatedUser : null;

  return {
    authenticated: true,
    user: serializeUser(user),
    isAdmin,
    impersonatedUser: impersonatedUser ? serializeUser(impersonatedUser) : null,
  };
});
