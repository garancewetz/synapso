import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getJournalTaskById, updateJournalTask, deleteJournalTask } from '@/app/features/journal/api';

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
    
    const task = await getJournalTaskById({
      taskId: id,
      userId,
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal task not found') {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }
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

    const updatedTask = await updateJournalTask({
      taskId: id,
      userId,
      data: {
        title: updatedData.title,
        completed: updatedData.completed,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal task not found') {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }
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

    const updatedTask = await updateJournalTask({
      taskId: id,
      userId,
      data: {
        completed,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal task not found') {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }
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

    await deleteJournalTask({
      taskId: id,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal task not found') {
      return NextResponse.json(
        { error: 'Journal task not found' },
        { status: 404 }
      );
    }
    logError('Error deleting journal task', error);
    return NextResponse.json(
      { error: 'Failed to delete journal task' },
      { status: 500 }
    );
  }
}

