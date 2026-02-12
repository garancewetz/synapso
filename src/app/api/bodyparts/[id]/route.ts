import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getBodypart, updateBodypart, deleteBodypart } from '@/app/features/exercices/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const bodypartId = parseInt(id);

    if (isNaN(bodypartId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const bodypart = await getBodypart({ id: bodypartId });

    if (!bodypart) {
      return NextResponse.json(
        { error: 'Partie du corps non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(bodypart);
  } catch (error) {
    logError('Erreur lors de la récupération du bodypart', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du bodypart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const bodypartId = parseInt(id);

    if (isNaN(bodypartId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    const bodypart = await updateBodypart({ id: bodypartId, name });
    return NextResponse.json(bodypart);
  } catch (error) {
    logError('Erreur lors de la mise à jour du bodypart', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du bodypart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const bodypartId = parseInt(id);

    if (isNaN(bodypartId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const result = await deleteBodypart({ id: bodypartId });
    return NextResponse.json(result);
  } catch (error) {
    logError('Erreur lors de la suppression du bodypart', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du bodypart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

