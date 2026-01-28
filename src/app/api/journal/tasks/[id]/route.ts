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
    
    const task = await prisma.journalTask.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    logError('Error fetching journal task', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal task' },
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

    // Vérifier que la tâche appartient à l'utilisateur
    const task = await prisma.journalTask.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }

    const updatedTask = await prisma.journalTask.update({
      where: { id },
      data: {
        title: updatedData.title !== undefined ? updatedData.title.trim() : undefined,
        completed: updatedData.completed !== undefined ? updatedData.completed : undefined,
        completedAt: updatedData.completed === true ? new Date() : (updatedData.completed === false ? null : undefined),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    logError('Error updating journal task', error);
    return NextResponse.json(
      { error: 'Failed to update journal task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { completed } = await request.json();

    // Vérifier que la tâche appartient à l'utilisateur
    const task = await prisma.journalTask.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }

    // ❌ IMPORTANT: Ne PAS créer de progrès automatiquement
    // Le toggle completed ne doit que mettre à jour la tâche
    const updatedTask = await prisma.journalTask.update({
      where: { id },
      data: {
        completed: completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    logError('Error updating journal task completion', error);
    return NextResponse.json(
      { error: 'Failed to update journal task completion' },
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

    // Vérifier que la tâche appartient à l'utilisateur
    const task = await prisma.journalTask.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }
    
    await prisma.journalTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error deleting journal task', error);
    return NextResponse.json(
      { error: 'Failed to delete journal task' },
      { status: 500 }
    );
  }
}

