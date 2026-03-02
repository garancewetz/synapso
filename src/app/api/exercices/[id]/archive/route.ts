import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAuthContext } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { archiveExercice } from '@/app/features/exercices/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const { id } = parsed;

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
        { error: 'Utilisateur non trouvé' },
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
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de l\'archivage de l\'exercice', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'archivage de l\'exercice' },
      { status: 500 }
    );
  }
}
