import { NextResponse, NextRequest } from 'next/server';
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

    // Vérifier que la victoire existe
    const existingVictory = await prisma.victory.findUnique({
      where: { id: victoryId },
    });

    if (!existingVictory) {
      return NextResponse.json(
        { error: 'Victory not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content, emoji } = body;

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
        emoji: emoji || null,
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

    // Vérifier que la victoire existe
    const existingVictory = await prisma.victory.findUnique({
      where: { id: victoryId },
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

