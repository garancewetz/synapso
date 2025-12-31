import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const victoryId = parseInt(id);

    if (isNaN(victoryId)) {
      return NextResponse.json(
        { error: 'Invalid victory ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, emoji, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    // Vérifier que la victoire appartient à l'utilisateur
    const existingVictory = await prisma.victory.findFirst({
      where: {
        id: victoryId,
        userId: userIdNumber,
      },
    });

    if (!existingVictory) {
      return NextResponse.json(
        { error: 'Victory not found' },
        { status: 404 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const updatedVictory = await prisma.victory.update({
      where: { id: victoryId },
      data: {
        content: content.trim(),
        emoji: emoji ? emoji.trim() : null,
      },
    });

    return NextResponse.json(updatedVictory);
  } catch (error) {
    console.error('Error updating victory:', error);
    return NextResponse.json(
      { error: 'Failed to update victory' },
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
    const victoryId = parseInt(id);

    if (isNaN(victoryId)) {
      return NextResponse.json(
        { error: 'Invalid victory ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    // Vérifier que la victoire appartient à l'utilisateur
    const existingVictory = await prisma.victory.findFirst({
      where: {
        id: victoryId,
        userId: userIdNumber,
      },
    });

    if (!existingVictory) {
      return NextResponse.json(
        { error: 'Victory not found' },
        { status: 404 }
      );
    }

    await prisma.victory.delete({
      where: { id: victoryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting victory:', error);
    return NextResponse.json(
      { error: 'Failed to delete victory' },
      { status: 500 }
    );
  }
}

