import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { ExerciceCategory } from '@/app/types/exercice';
import { Prisma } from '@prisma/client';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';

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
        { error: 'Invalid exercice id' },
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

    // Parser le body
    const body = await request.json();
    const { archived } = body;

    if (typeof archived !== 'boolean') {
      return NextResponse.json(
        { error: 'Le champ archived doit être un booléen' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur pour calculer les statuts
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

    // Vérifier que l'exercice appartient à l'utilisateur
    const existingExercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });

    if (!existingExercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const startOfPeriod = getStartOfPeriod(user.resetFrequency, now);
    const endOfPeriod = addDays(startOfPeriod, user.resetFrequency === 'DAILY' ? 1 : 7);
    const startOfToday = startOfDay(now);
    const endOfToday = startOfDay(addDays(now, 1));

    // Mettre à jour l'exercice
    const updated = await prisma.exercice.update({
      where: { id },
      data: {
        archived,
        archivedAt: archived ? new Date() : null,
      } as Prisma.ExerciceUpdateInput,
    });

    // Récupérer les bodyparts séparément
    const exerciceBodyparts = await prisma.exerciceBodypart.findMany({
      where: { exerciceId: id },
      include: {
        bodypart: true,
      },
    });

    // Récupérer l'historique pour calculer les statuts
    const history = await prisma.history.findMany({
      where: {
        exerciceId: id,
        completedAt: {
          gte: startOfPeriod,
          lt: endOfPeriod,
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    // Parser les équipements
    let equipmentsParsed: string[] = [];
    try {
      equipmentsParsed = JSON.parse(updated.equipments || '[]');
    } catch {
      equipmentsParsed = [];
    }

    // Extraire les noms des bodyparts
    const bodypartsNames = exerciceBodyparts.map((eb) => eb.bodypart.name);

    // Calculer les statuts
    const weeklyCompletions = history.map((h) => h.completedAt);
    const completedInPeriod = weeklyCompletions.length > 0;
    const hasTodayHistory = history.some(
      (h) => h.completedAt >= startOfToday && h.completedAt < endOfToday
    );
    const completedToday = hasTodayHistory;

    // Formater la réponse
    const formattedExercice = {
      id: updated.id,
      name: updated.name,
      description: {
        text: updated.descriptionText,
        comment: updated.descriptionComment,
      },
      workout: {
        repeat: updated.workoutRepeat,
        series: updated.workoutSeries,
        duration: updated.workoutDuration,
      },
      equipments: equipmentsParsed,
      bodyparts: bodypartsNames,
      category: updated.category as ExerciceCategory,
      completed: completedInPeriod,
      completedToday: completedToday,
      completedAt: updated.completedAt,
      pinned: updated.pinned ?? false,
      weeklyCompletions: weeklyCompletions,
      media: updated.media ?? null,
      archived: (updated as { archived?: boolean }).archived ?? false,
      archivedAt: (updated as { archivedAt?: Date | null }).archivedAt ?? null,
    };

    return NextResponse.json(formattedExercice);
  } catch (error) {
    logError('Error archiving exercice', error);
    return NextResponse.json(
      { error: 'Failed to archive exercice' },
      { status: 500 }
    );
  }
}
