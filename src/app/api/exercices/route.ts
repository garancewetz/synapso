import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { getExercices } from '@/app/features/exercices/api';
import { ExerciceCategory } from '@/app/types/exercice';

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
