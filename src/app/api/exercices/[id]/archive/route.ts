import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { archiveExercice } from '@/app/features/exercices/api';

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
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { archived } = body;

    if (typeof archived !== 'boolean') {
      return NextResponse.json(
        { error: 'Le champ archived doit être un booléen' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const exercice = await archiveExercice({
      exerciceId: id,
      userId,
      archived,
      resetFrequency: user.resetFrequency || 'DAILY',
    });

    return NextResponse.json(exercice);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice not found') {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }
    logError('Error archiving exercice', error);
    return NextResponse.json(
      { error: 'Failed to archive exercice' },
      { status: 500 }
    );
  }
}
