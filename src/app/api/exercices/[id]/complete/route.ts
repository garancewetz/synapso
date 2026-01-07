import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { isCompletedToday, isCompletedInPeriod, getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const exercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userIdNumber,
      },
    });

    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les paramètres de l'utilisateur pour la réinitialisation
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
      select: { resetFrequency: true },
    });
    
    const resetFrequency = user?.resetFrequency || 'DAILY';
    const now = new Date();
    
    // Vérifier si l'exercice a été complété dans la période courante
    const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
    const completedInCurrentPeriod = isCompletedInPeriod(completedDate, resetFrequency, now);

    // Si complété dans la période, on démarque. Sinon, on marque comme complété
    const isCompleting = !completedInCurrentPeriod;
    
    // Utiliser une transaction pour garantir l'intégrité des données
    const updatedExercice = await prisma.$transaction(async (tx) => {
      const updated = await tx.exercice.update({
        where: { id },
        data: {
          completed: isCompleting,
          completedAt: isCompleting ? now : null,
        },
      });

      if (isCompleting) {
        // Marquer comme complété : ajouter une entrée dans l'historique
        await tx.history.create({
          data: {
            exerciceId: id,
            completedAt: now,
          },
        });
      } else {
        // Démarquer : supprimer l'entrée de complétion actuelle
        // En mode DAILY : supprimer l'entrée d'aujourd'hui
        // En mode WEEKLY : supprimer l'entrée correspondant à completedAt
        if (resetFrequency === 'DAILY') {
          await tx.history.deleteMany({
            where: {
              exerciceId: id,
              completedAt: {
                gte: startOfDay(now),
                lt: startOfDay(addDays(now, 1)),
              },
            },
          });
        } else {
          // Mode WEEKLY : supprimer l'entrée la plus récente de la période
          if (completedDate) {
            await tx.history.deleteMany({
              where: {
                exerciceId: id,
                completedAt: {
                  gte: startOfDay(completedDate),
                  lt: startOfDay(addDays(completedDate, 1)),
                },
              },
            });
          }
        }
      }

      return updated;
    });
    
    // Calculer completedToday pour la réponse
    const completedToday = isCompleting && updatedExercice.completedAt
      ? isCompletedToday(new Date(updatedExercice.completedAt), now)
      : false;

    // Récupérer toutes les complétions de la période pour weeklyCompletions
    const startOfPeriod = getStartOfPeriod(resetFrequency, now);
    const endOfPeriod = resetFrequency === 'DAILY'
      ? startOfDay(addDays(now, 1))
      : startOfDay(addDays(startOfPeriod, 7));

    const weeklyHistory = await prisma.history.findMany({
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

    const weeklyCompletions = weeklyHistory.map(h => h.completedAt);
    const completedInPeriod = weeklyCompletions.length > 0;

    return NextResponse.json({
      ...updatedExercice,
      completed: completedInPeriod,
      completedToday: completedToday,
      weeklyCompletions: weeklyCompletions,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour de l\'exercice',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

