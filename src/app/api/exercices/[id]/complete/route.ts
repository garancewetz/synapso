import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { isCompletedInPeriod, isCompletedToday, getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    });
    
    // Récupérer le resetFrequency (avec cast pour contourner le problème de type Prisma)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetFrequency = (user as any)?.resetFrequency || 'DAILY';
    
    // Vérifier si l'exercice a été complété dans la période de réinitialisation
    const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
    const completedInPeriod = isCompletedInPeriod(completedDate, resetFrequency);

    // Si complété dans la période, on démarque. Sinon, on marque comme complété
    const isCompleting = !completedInPeriod;
    
    const now = new Date();
    const updatedExercice = await prisma.exercice.update({
      where: { id },
      data: {
        completed: isCompleting,
        completedAt: isCompleting ? now : null,
      },
    });
    
    // Calculer completedToday pour la réponse
    const completedToday = isCompleting && updatedExercice.completedAt
      ? isCompletedToday(new Date(updatedExercice.completedAt), now)
      : false;

    if (isCompleting) {
      // Marquer comme complété : ajouter une entrée dans l'historique
      await prisma.history.create({
        data: {
          exerciceId: id,
          completedAt: new Date(),
        },
      });
    } else {
      // Démarquer : supprimer les entrées de la période dans l'historique
      const now = new Date();
      const startOfPeriod = getStartOfPeriod(resetFrequency, now);
      
      // Calculer la fin de période
      let endOfPeriod: Date;
      if (resetFrequency === 'DAILY') {
        // Pour DAILY, endOfPeriod est le lendemain minuit
        endOfPeriod = startOfDay(addDays(now, 1));
      } else {
        // Pour WEEKLY, endOfPeriod est le prochain dimanche minuit
        endOfPeriod = startOfDay(addDays(startOfPeriod, 7));
      }
      
      await prisma.history.deleteMany({
        where: {
          exerciceId: id,
          completedAt: {
            gte: startOfPeriod,
            lt: endOfPeriod,
          },
        },
      });
    }

    return NextResponse.json({
      ...updatedExercice,
      completed: isCompleting,
      completedToday: completedToday,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'exercice' },
      { status: 500 }
    );
  }
}

