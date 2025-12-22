import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { isCompletedInPeriod, isCompletedToday, getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
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
    
    // Vérifier si l'exercice a été complété dans la période de réinitialisation
    const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
    const completedInPeriod = isCompletedInPeriod(completedDate, resetFrequency);

    // Si complété dans la période, on démarque. Sinon, on marque comme complété
    const isCompleting = !completedInPeriod;
    
    const now = new Date();
    
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
        // Démarquer : supprimer les entrées de la période dans l'historique
        const startOfPeriod = getStartOfPeriod(resetFrequency, now);
        
        // Calculer la fin de période
        const endOfPeriod = resetFrequency === 'DAILY'
          ? startOfDay(addDays(now, 1))
          : startOfDay(addDays(startOfPeriod, 7));
        
        await tx.history.deleteMany({
          where: {
            exerciceId: id,
            completedAt: {
              gte: startOfPeriod,
              lt: endOfPeriod,
            },
          },
        });
      }

      return updated;
    });
    
    // Calculer completedToday pour la réponse
    const completedToday = isCompleting && updatedExercice.completedAt
      ? isCompletedToday(new Date(updatedExercice.completedAt), now)
      : false;

    return NextResponse.json({
      ...updatedExercice,
      completed: isCompleting,
      completedToday: completedToday,
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

