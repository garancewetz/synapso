import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

/**
 * GET /api/admin/users
 * Liste tous les utilisateurs (admin only)
 */
export async function GET(request: NextRequest) {
  // Vérifier que l'utilisateur est admin
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
        isAphasic: true,
        createdAt: true,
        _count: {
          select: {
            exercices: true,
            progress: true,
            aphasieItems: true,
            aphasieChallenges: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

