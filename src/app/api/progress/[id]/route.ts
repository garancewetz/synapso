import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { updateProgress, deleteProgress } from '@/app/features/progress/api';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { validateBody, requireJsonContentType, updateProgressSchema } from '@/app/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const ctError = requireJsonContentType(request);
  if (ctError) return ctError;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const progressId = parsed.id;

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = validateBody(updateProgressSchema, body);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;

    const updatedProgress = await updateProgress({
      progressId,
      userId,
      data: {
        content: data.content,
        emoji: data.emoji ?? null,
        tags: data.tags,
        medias: data.medias,
      },
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    if (error instanceof Error && error.message === 'Progress not found') {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      );
    }
    logError('Error updating progress', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
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
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const progressId = parsed.id;

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    await deleteProgress({
      progressId,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Progress not found') {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      );
    }
    logError('Error deleting progress', error);
    return NextResponse.json(
      { error: 'Failed to delete progress' },
      { status: 500 }
    );
  }
}
