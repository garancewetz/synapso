import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

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

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }
    
    const note = await prisma.journalNote.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });
    
    if (!note) {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    logError('Error fetching journal note', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal note' },
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

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const updatedData = await request.json();

    // Vérifier que la note appartient à l'utilisateur
    const existingNote = await prisma.journalNote.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }

    // Valider le champ requis
    if (!updatedData.content || !updatedData.content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
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

    const note = await prisma.journalNote.update({
      where: { id },
      data: {
        content: updatedData.content.trim(),
        title: updatedData.title !== undefined ? (updatedData.title ? updatedData.title.trim() : null) : undefined,
        date: dateValue !== undefined ? dateValue : undefined,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    logError('Error updating journal note', error);
    return NextResponse.json(
      { error: 'Failed to update journal note' },
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

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que la note appartient à l'utilisateur
    const existingNote = await prisma.journalNote.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }
    
    await prisma.journalNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error deleting journal note', error);
    return NextResponse.json(
      { error: 'Failed to delete journal note' },
      { status: 500 }
    );
  }
}

