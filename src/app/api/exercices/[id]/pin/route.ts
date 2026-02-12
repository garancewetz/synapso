import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { pinExercice } from '@/app/features/exercices/api';

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
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const result = await pinExercice({
      exerciceId: id,
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la mise à jour du pin', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du pin' },
      { status: 500 }
    );
  }
}

