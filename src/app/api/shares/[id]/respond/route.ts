import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { respondToShare } from '@/app/features/sharing/api';

/**
 * POST /api/shares/:id/respond
 * Body: { action: 'ACCEPTED' | 'REJECTED' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const shareId = parseInt(id, 10);
    if (isNaN(shareId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !['ACCEPTED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: 'action doit être ACCEPTED ou REJECTED' },
        { status: 400 }
      );
    }

    const result = await respondToShare({
      shareId,
      receiverId: userId,
      action,
    });

    if (!result.success) {
      if (result.reason === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Partage non trouvé ou déjà traité' }, { status: 404 });
      }
      if (result.reason === 'EXERCICE_DELETED') {
        return NextResponse.json({ error: "L'exercice original a été supprimé" }, { status: 410 });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    logError('Error responding to share', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
