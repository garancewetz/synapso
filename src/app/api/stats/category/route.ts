import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { getCategoryStats } from '@/app/features/historique/api';

/**
 * Route API pour les statistiques de complétion par catégorie
 * Utilise des agrégations SQL pour réduire le transfert réseau de 80-90%
 * 
 * GET /api/stats/category?targetDate=2026-01-15
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with id ${userId} not found` },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetDateParam = searchParams.get('targetDate');

    const stats = await getCategoryStats({
      userId,
      targetDate: targetDateParam || undefined,
      resetFrequency: user.resetFrequency || 'DAILY',
    });

    return NextResponse.json(stats);
  } catch (error) {
    logError('Error fetching category stats', error);
    return NextResponse.json(
      { error: 'Failed to fetch category stats' },
      { status: 500 }
    );
  }
}
