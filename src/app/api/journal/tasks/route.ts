import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

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

    const tasks = await prisma.journalTask.findMany({
      where: {
        userId: userId,
      },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' },
      ],
    });

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
    const { title, completed } = data;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const task = await prisma.journalTask.create({
      data: {
        title: title.trim(),
        completed: completed || false,
        userId: userId,
      },
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

