import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { validateJournalNote } from '@/app/features/journal/api';

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

    const result = await validateJournalNote({ noteId: id, userId });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal note not found') {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la validation journal note', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}
