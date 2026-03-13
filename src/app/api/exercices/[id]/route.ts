import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { getAuthContext } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { CACHE_TAGS } from '@/app/lib/cache';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { getExercice, updateExercice, deleteExercice } from '@/app/features/exercices/api';
import { validateBody, requireJsonContentType, updateExerciceSchema } from '@/app/lib/validation';

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

    const ctError = requireJsonContentType(request);
    if (ctError) return ctError;

    const updatedData = await request.json();

    const validated = validateBody(updateExerciceSchema, updatedData);
    if (validated instanceof NextResponse) return validated;
    const validatedData = validated.data;

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

    const { description, workout, ...rest } = validatedData;
    const data = {
      ...rest,
      ...(description && {
        descriptionText: description.text,
        descriptionComment: description.comment ?? null,
      }),
      ...(workout && {
        workoutRepeat: workout.repeat ?? null,
        workoutSeries: workout.series ?? null,
        workoutDuration: workout.duration ?? null,
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
