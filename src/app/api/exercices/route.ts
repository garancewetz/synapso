import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { getExercices, createExercice } from '@/app/features/exercices/api';
import { ExerciceCategory } from '@/app/types/exercice';
import { validateBody, requireJsonContentType, createExerciceSchema } from '@/app/lib/validation';

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const ctError = requireJsonContentType(request);
  if (ctError) return ctError;

  try {
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const parsed = validateBody(createExerciceSchema, body);
    if (parsed instanceof NextResponse) return parsed;
    const data = parsed.data;

    const exercice = await createExercice({
      name: data.name,
      descriptionText: data.description?.text || '',
      descriptionComment: data.description?.comment || null,
      workoutRepeat: data.workout?.repeat || null,
      workoutSeries: data.workout?.series || null,
      workoutDuration: data.workout?.duration || null,
      category: data.category,
      bodyparts: data.bodyparts as unknown as string[],
      equipments: data.equipments,
      media: data.media || undefined,
      userId,
      ...(data.createdAt && { createdAt: new Date(data.createdAt) }),
    });

    return NextResponse.json(exercice, { status: 201 });
  } catch (error) {
    logError('Error creating exercice', error);
    return NextResponse.json(
      { error: 'Failed to create exercice' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as ExerciceCategory | null;
    const equipmentsParam = searchParams.get('equipments');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const targetDateParam = searchParams.get('targetDate');

    const selectedEquipments = equipmentsParam
      ? equipmentsParam.split(',').map(eq => decodeURIComponent(eq).trim()).filter(Boolean)
      : [];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with id ${userId} not found` },
        { status: 404 }
      );
    }

    const exercices = await getExercices({
      userId,
      category,
      equipments: selectedEquipments,
      includeArchived,
      targetDate: targetDateParam || undefined,
      resetFrequency: user.resetFrequency || 'DAILY',
    });
    
    return NextResponse.json(exercices);
  } catch (error) {
    logError('Error fetching exercices', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercices' },
      { status: 500 }
    );
  }
}
