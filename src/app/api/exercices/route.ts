import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { getExercices, createExercice } from '@/app/features/exercices/api';
import { ExerciceCategory } from '@/app/types/exercice';

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    if (body.category && !['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE', 'FACE'].includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be UPPER_BODY, LOWER_BODY, STRETCHING, CORE, or FACE' },
        { status: 400 }
      );
    }

    const exercice = await createExercice({
      name: body.name.trim(),
      descriptionText: body.description?.text || '',
      descriptionComment: body.description?.comment || null,
      workoutRepeat: body.workout?.repeat || null,
      workoutSeries: body.workout?.series || null,
      workoutDuration: body.workout?.duration || null,
      category: body.category || 'UPPER_BODY',
      bodyparts: body.bodyparts || [],
      equipments: body.equipments || [],
      media: body.media || undefined,
      userId,
      ...(body.createdAt && { createdAt: new Date(body.createdAt) }),
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
