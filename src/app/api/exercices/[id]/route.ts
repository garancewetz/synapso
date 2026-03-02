import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { getAuthContext } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { CACHE_TAGS } from '@/app/lib/cache';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { getExercice, updateExercice, deleteExercice } from '@/app/features/exercices/api';

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseTargetDate(dateKeyParam: string | null): Date {
  if (!dateKeyParam || !DATE_KEY_REGEX.test(dateKeyParam)) {
    return new Date();
  }
  return new Date(dateKeyParam + 'T12:00:00.000Z');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const { id } = parsed;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetDate = parseTargetDate(searchParams.get('targetDate'));

    const exercice = await getExercice({
      exerciceId: id,
      userId,
      resetFrequency: user.resetFrequency || 'DAILY',
      targetDate,
    });

    return NextResponse.json(exercice);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la récupération de l\'exercice', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'exercice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const { id } = parsed;

    const updatedData = await request.json();

    if (updatedData.name !== undefined && (!updatedData.name || !updatedData.name.trim())) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    if (updatedData.category && !['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(updatedData.category)) {
      return NextResponse.json(
        { error: 'Catégorie invalide. Valeurs attendues : UPPER_BODY, LOWER_BODY, STRETCHING, CORE' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
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
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la mise à jour de l\'exercice', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'exercice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const { id } = parsed;

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
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la suppression de l\'exercice', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'exercice' },
      { status: 500 }
    );
  }
}
