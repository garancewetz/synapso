import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getPendingShareCount } from '@/app/features/sharing/api';

/**
 * GET /api/shares/count - Nombre de partages en attente
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const count = await getPendingShareCount(userId);
    return NextResponse.json({ count });
  } catch (error) {
    logError('Error fetching pending share count', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
