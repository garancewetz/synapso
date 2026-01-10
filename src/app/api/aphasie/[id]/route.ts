import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(
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
        { error: 'Invalid ID' },
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
    
    const item = await prisma.aphasieItem.findFirst({
      where: { 
        id,
        userId: userIdNumber,
      },
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
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const updatedData = await request.json();

    if (!updatedData.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(updatedData.userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    // Vérifier que l'item appartient à l'utilisateur
    const existingItem = await prisma.aphasieItem.findFirst({
      where: {
        id,
        userId: userIdNumber,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Aphasie item not found' },
        { status: 404 }
      );
    }

    // Valider les champs requis
    if (!updatedData.quote || !updatedData.quote.trim()) {
      return NextResponse.json(
        { error: 'quote is required' },
        { status: 400 }
      );
    }

    if (!updatedData.meaning || !updatedData.meaning.trim()) {
      return NextResponse.json(
        { error: 'meaning is required' },
        { status: 400 }
      );
    }

    // Convertir la date string (YYYY-MM-DD) en DateTime si fournie
    let dateValue: Date | null = null;
    if (updatedData.date) {
      const parsedDate = new Date(updatedData.date);
      if (!isNaN(parsedDate.getTime())) {
        dateValue = parsedDate;
      }
    }

    const item = await prisma.aphasieItem.update({
      where: { id },
      data: {
        quote: updatedData.quote.trim(),
        meaning: updatedData.meaning.trim(),
        date: dateValue,
        comment: updatedData.comment ? updatedData.comment.trim() : null,
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
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
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

    // Vérifier que l'item appartient à l'utilisateur
    const existingItem = await prisma.aphasieItem.findFirst({
      where: {
        id,
        userId: userIdNumber,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Aphasie item not found' },
        { status: 404 }
      );
    }
    
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

