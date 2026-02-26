import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getShareableUsers } from '@/app/features/sharing/api';

/**
 * GET /api/shares/users
 * Liste les utilisateurs disponibles pour le partage (exclut l'utilisateur courant)
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const users = await getShareableUsers(userId);
    return NextResponse.json(users);
  } catch (error) {
    logError('Error fetching shareable users', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
