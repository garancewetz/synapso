import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getJournalTasks, createJournalTask } from '@/app/features/journal/api';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const tasks = await getJournalTasks({ userId });

    return NextResponse.json(tasks);
  } catch (error) {
    logError('Error fetching journal tasks', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Journal tasks error details:', { errorMessage, errorStack, error });
    return NextResponse.json(
      { 
        error: 'Failed to fetch journal tasks',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title } = data;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const task = await createJournalTask({
      title: title.trim(),
      userId: userId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logError('Error creating journal task', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Journal task creation error details:', { errorMessage, errorStack, error });
    return NextResponse.json(
      { 
        error: 'Failed to create journal task',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

