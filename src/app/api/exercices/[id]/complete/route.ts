import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      select: { resetFrequency: true },
    });
    
    const resetFrequency = user?.resetFrequency || 'DAILY';
    
    // Vérifier si l'exercice a été complété dans la période de réinitialisation
    let completedInPeriod = false;
    if (exercice.completedAt) {
      const completedDate = new Date(exercice.completedAt);
      const now = new Date();
      
      if (resetFrequency === 'DAILY') {
        // Réinitialisation quotidienne : vérifier si complété aujourd'hui
        completedInPeriod = 
          completedDate.getDate() === now.getDate() &&
          completedDate.getMonth() === now.getMonth() &&
          completedDate.getFullYear() === now.getFullYear();
      } else if (resetFrequency === 'WEEKLY') {
        // Réinitialisation hebdomadaire : vérifier si complété cette semaine (depuis dimanche minuit)
        const completedTime = completedDate.getTime();
        const nowTime = now.getTime();
        
        // Trouver le dernier dimanche à minuit
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - now.getDay()); // Dimanche = 0
        lastSunday.setHours(0, 0, 0, 0);
        
        completedInPeriod = completedTime >= lastSunday.getTime() && completedTime <= nowTime;
      }
    }

    // Si complété dans la période, on démarque. Sinon, on marque comme complété
    const isCompleting = !completedInPeriod;
    
    const updatedExercice = await prisma.exercice.update({
      where: { id },
      data: {
        completed: isCompleting,
        completedAt: isCompleting ? new Date() : null,
      },
    });

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
      let startOfPeriod: Date;
      let endOfPeriod: Date = new Date();
      
      if (resetFrequency === 'DAILY') {
        // Supprimer les entrées d'aujourd'hui
        const today = new Date();
        startOfPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endOfPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      } else if (resetFrequency === 'WEEKLY') {
        // Supprimer les entrées depuis le dernier dimanche
        const now = new Date();
        startOfPeriod = new Date(now);
        startOfPeriod.setDate(now.getDate() - now.getDay()); // Dimanche = 0
        startOfPeriod.setHours(0, 0, 0, 0);
      } else {
        // Par défaut, quotidien
        const today = new Date();
        startOfPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endOfPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
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

    return NextResponse.json(updatedExercice);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'exercice' },
      { status: 500 }
    );
  }
}

