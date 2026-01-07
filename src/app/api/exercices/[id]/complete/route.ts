import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { isCompletedToday, getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
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
    
    // En mode hebdomadaire, vérifier s'il y a déjà une entrée pour aujourd'hui
    // En mode quotidien, vérifier s'il y a une entrée pour aujourd'hui
    const startOfToday = startOfDay(now);
    const endOfToday = startOfDay(addDays(now, 1));
    
    const todayHistory = await prisma.history.findFirst({
      where: {
        exerciceId: id,
        completedAt: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    });
    
    // Si complété aujourd'hui, on démarque. Sinon, on marque comme complété
    const isCompleting = !todayHistory;
    
    // Utiliser une transaction pour garantir l'intégrité des données
    const updatedExercice = await prisma.$transaction(async (tx) => {
      if (isCompleting) {
        // Marquer comme complété : ajouter une entrée dans l'historique
        await tx.history.create({
          data: {
            exerciceId: id,
            completedAt: now,
          },
        });
        
        // Mettre à jour completedAt avec la date actuelle
        const updated = await tx.exercice.update({
          where: { id },
          data: {
            completedAt: now,
          },
        });
        
        return updated;
      } else {
        // Démarquer : supprimer l'entrée d'aujourd'hui
        await tx.history.deleteMany({
          where: {
            exerciceId: id,
            completedAt: {
              gte: startOfToday,
              lt: endOfToday,
            },
          },
        });
        
        // Mettre à jour completedAt : prendre la date de la dernière entrée de l'historique
        // ou null si aucune entrée n'existe
        const remainingHistory = await tx.history.findFirst({
          where: {
            exerciceId: id,
          },
          orderBy: {
            completedAt: 'desc',
          },
        });
        
        const updated = await tx.exercice.update({
          where: { id },
          data: {
            completedAt: remainingHistory?.completedAt || null,
          },
        });
        
        return updated;
      }
    });
    
    // Calculer completedToday pour la réponse : vérifier s'il y a une entrée pour aujourd'hui
    const completedToday = isCompleting;

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

