import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { logError } from '@/app/lib/logger';

/**
 * GET /api/users
 * Liste tous les utilisateurs - ADMIN ONLY
 * Pour les utilisateurs normaux, utiliser /api/auth/check
 */
export async function GET(request: NextRequest) {
  // Seuls les admins peuvent lister tous les utilisateurs
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
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

    return NextResponse.json(users);
  } catch (error) {
    logError('Error fetching users', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST est supprimé - la création de compte passe maintenant par /api/auth/register
