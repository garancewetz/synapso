import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { updateProgress, deleteProgress } from '@/app/features/progress/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const progressId = parseInt(id);

    if (isNaN(progressId)) {
      return NextResponse.json(
        { error: 'Invalid progress ID' },
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
    const { content, emoji, tags, medias } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const updatedProgress = await updateProgress({
      progressId,
      userId,
      data: {
        content: content.trim(),
        emoji: emoji ? emoji.trim() : null,
        tags: Array.isArray(tags) ? tags : undefined,
        medias: Array.isArray(medias) ? medias : undefined,
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
    const { id } = await params;
    const progressId = parseInt(id);

    if (isNaN(progressId)) {
      return NextResponse.json(
        { error: 'Invalid progress ID' },
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
