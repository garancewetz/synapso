import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { completeExercice } from '@/app/features/exercices/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    let completedAt = new Date();
    let resetFrequency: 'DAILY' | 'WEEKLY' = 'DAILY';
    try {
      const body = await request.json();
      if (body?.completedAt && /^\d{4}-\d{2}-\d{2}$/.test(body.completedAt)) {
        completedAt = new Date(body.completedAt + 'T12:00:00.000Z');
      }
      if (body?.resetFrequency === 'WEEKLY') {
        resetFrequency = 'WEEKLY';
      }
    } catch {
      // Body vide, utiliser les valeurs par défaut
    }

    const result = await completeExercice({
      exerciceId: id,
      userId,
      completedAt,
      resetFrequency,
    });

    console.log('[API-COMPLETE] ✅', result.completed ? 'COMPLÉTÉ' : 'DÉCOMPLÉTÉ', { exerciceId: id, result });
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
