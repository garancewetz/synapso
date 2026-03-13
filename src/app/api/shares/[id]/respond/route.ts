import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { respondToShare } from '@/app/features/sharing/api';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { validateBody, requireJsonContentType, respondToShareSchema } from '@/app/lib/validation';

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

    const ctError = requireJsonContentType(request);
    if (ctError) return ctError;

    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const shareId = parsed.id;

    const body = await request.json();
    const validated = validateBody(respondToShareSchema, body);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;

    const result = await respondToShare({
      shareId,
      receiverId: userId,
      action: data.action,
    });

    if (!result.success) {
      if (result.reason === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 });
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
