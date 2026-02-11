import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { startOfDay, addDays } from 'date-fns';

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
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const exercice = await prisma.exercice.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    let completedAt = new Date();
    try {
      const body = await request.json();
      if (body?.completedAt && /^\d{4}-\d{2}-\d{2}$/.test(body.completedAt)) {
        completedAt = new Date(body.completedAt + 'T12:00:00.000Z');
      }
    } catch {
      // Body vide, utiliser la date actuelle
    }

    const targetDate = startOfDay(completedAt);
    const endOfTargetDate = startOfDay(addDays(completedAt, 1));

    const deleted = await prisma.history.deleteMany({
      where: {
        exerciceId: id,
        completedAt: { gte: targetDate, lt: endOfTargetDate },
      },
    });

    if (deleted.count > 0) {
      const lastHistory = await prisma.history.findFirst({
        where: { exerciceId: id },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      });

      await prisma.exercice.update({
        where: { id },
        data: {
          completed: !!lastHistory,
          completedAt: lastHistory?.completedAt || null,
        },
      });

      return NextResponse.json({
        completed: !!lastHistory,
        completedToday: false,
        completedAt: lastHistory?.completedAt || null,
        weeklyCompletions: [],
      });
    } else {
      await Promise.all([
        prisma.history.create({
          data: { exerciceId: id, completedAt },
        }),
        prisma.exercice.update({
          where: { id },
          data: {
            completed: true,
            completedAt,
          },
        }),
      ]);

      return NextResponse.json({
        completed: true,
        completedToday: true,
        completedAt,
        weeklyCompletions: [],
      });
    }
  } catch (error) {
    logError('Erreur lors de la mise à jour', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'exercice' },
      { status: 500 }
    );
  }
}
