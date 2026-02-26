import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { ExerciceCategory } from '@/app/types/exercice';
import { CACHE_TAGS } from '@/app/lib/cache';
import { getExercice, updateExercice, deleteExercice } from '@/app/features/exercices/api';

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
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetDateParam = searchParams.get('targetDate');
    let targetDate = new Date();
    if (targetDateParam) {
      const parsedDate = new Date(targetDateParam);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }

    const exercice = await getExercice({
      exerciceId: id,
      userId,
      resetFrequency: user.resetFrequency || 'DAILY',
      targetDate,
    });

    return NextResponse.json(exercice);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice not found') {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }
    logError('Error fetching exercice', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercice' },
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
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const updatedData = await request.json();

    if (updatedData.name !== undefined && (!updatedData.name || !updatedData.name.trim())) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    if (updatedData.category && !['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(updatedData.category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be UPPER_BODY, LOWER_BODY, STRETCHING, or CORE' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const data = {
      ...updatedData,
      ...(updatedData.description && {
        descriptionText: updatedData.description.text,
        descriptionComment: updatedData.description.comment ?? null,
      }),
      ...(updatedData.workout && {
        workoutRepeat: updatedData.workout.repeat ?? null,
        workoutSeries: updatedData.workout.series ?? null,
        workoutDuration: updatedData.workout.duration ?? null,
      }),
    };

    const exercice = await updateExercice({
      exerciceId: id,
      userId,
      data,
      resetFrequency: user.resetFrequency || 'DAILY',
    });

    return NextResponse.json(exercice);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice not found') {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }
    logError('Error updating exercice', error);
    return NextResponse.json(
      { error: 'Failed to update exercice' },
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
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    await deleteExercice({
      exerciceId: id,
      userId,
    });

    revalidateTag(CACHE_TAGS.EXERCICES, 'max');
    revalidateTag(CACHE_TAGS.EXERCICE(id), 'max');
    revalidateTag(CACHE_TAGS.USER_EXERCICES(userId), 'max');
    revalidateTag(CACHE_TAGS.METADATA, 'max');
    revalidateTag(CACHE_TAGS.USER_METADATA(userId), 'max');

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice not found') {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }
    logError('Error deleting exercice', error);
    return NextResponse.json(
      { error: 'Failed to delete exercice' },
      { status: 500 }
    );
  }
}
