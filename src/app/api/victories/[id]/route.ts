import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

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

