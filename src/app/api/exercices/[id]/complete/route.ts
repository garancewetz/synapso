import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { completeExercice } from '@/app/features/exercices/api';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { validateBody, requireJsonContentType, completeExerciceSchema } from '@/app/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const { id } = parsed;

    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const ctError = requireJsonContentType(request);
    if (ctError) return ctError;

    let completedAt = new Date();
    let resetFrequency: 'DAILY' | 'WEEKLY' = 'DAILY';
    try {
      const body = await request.json();
      const parsed = validateBody(completeExerciceSchema, body);
      if (parsed instanceof NextResponse) return parsed;
      const data = parsed.data;
      if (data.completedAt) {
        completedAt = new Date(data.completedAt + 'T12:00:00.000Z');
      }
      resetFrequency = data.resetFrequency;
    } catch {
      // Body vide, utiliser les valeurs par défaut
    }

    const result = await completeExercice({
      exerciceId: id,
      userId,
      completedAt,
      resetFrequency,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la mise à jour', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'exercice' },
      { status: 500 }
    );
  }
}
