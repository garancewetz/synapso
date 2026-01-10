import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';

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
    const { content, emoji } = body;

    // Vérifier que le progrès existe ET appartient à l'utilisateur
    const existingProgress = await prisma.progress.findFirst({
      where: {
        id: progressId,
        userId: userId,
      },
    });

    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const updatedProgress = await prisma.progress.update({
      where: { id: progressId },
      data: {
        content: content.trim(),
        emoji: emoji ? emoji.trim() : null,
      },
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error updating progress:', error);
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

    // Vérifier que le progrès existe ET appartient à l'utilisateur
    const existingProgress = await prisma.progress.findFirst({
      where: {
        id: progressId,
        userId: userId,
      },
    });

    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Progress not found' },
        { status: 404 }
      );
    }

    // Supprimer le progrès
    await prisma.progress.delete({
      where: { id: progressId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting progress:', error);
    return NextResponse.json(
      { error: 'Failed to delete progress' },
      { status: 500 }
    );
  }
}
