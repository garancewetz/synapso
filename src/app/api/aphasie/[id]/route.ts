import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const item = await prisma.aphasieItem.findUnique({
      where: { id },
    });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Aphasie item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching aphasie item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aphasie item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const updatedData = await request.json();

    const item = await prisma.aphasieItem.update({
      where: { id },
      data: {
        quote: updatedData.quote,
        meaning: updatedData.meaning,
        date: updatedData.date || null,
        comment: updatedData.comment || null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating aphasie item:', error);
    return NextResponse.json(
      { error: 'Failed to update aphasie item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérifier l'authentification
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    await prisma.aphasieItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting aphasie item:', error);
    return NextResponse.json(
      { error: 'Failed to delete aphasie item' },
      { status: 500 }
    );
  }
}

