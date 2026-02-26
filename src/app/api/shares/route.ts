import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { createShare, getReceivedShares } from '@/app/features/sharing/api';

/**
 * POST /api/shares - Créer un partage d'exercice
 */
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciceId, receiverId } = body;

    if (!exerciceId || !receiverId) {
      return NextResponse.json(
        { error: 'exerciceId et receiverId sont requis' },
        { status: 400 }
      );
    }

    const share = await createShare({
      exerciceId: Number(exerciceId),
      senderId: userId,
      receiverId: Number(receiverId),
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    if (message.includes('déjà en attente')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message.includes('non trouvé')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes('vous-même')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    logError('Error creating share', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/shares - Récupérer les partages reçus (PENDING)
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const shares = await getReceivedShares(userId);
    return NextResponse.json(shares);
  } catch (error) {
    logError('Error fetching received shares', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
