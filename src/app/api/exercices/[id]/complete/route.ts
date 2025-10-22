import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const exercice = await prisma.exercice.findUnique({
      where: { id },
    });

    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'exercice a été complété aujourd'hui
    let completedToday = false;
    if (exercice.completedAt) {
      const completedDate = new Date(exercice.completedAt);
      const today = new Date();
      completedToday = 
        completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear();
    }

    // Si complété aujourd'hui, on démarque. Sinon, on marque comme complété
    const isCompleting = !completedToday;
    
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
      // Démarquer : supprimer les entrées d'aujourd'hui dans l'historique
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      await prisma.history.deleteMany({
        where: {
          exerciceId: id,
          completedAt: {
            gte: startOfDay,
            lt: endOfDay,
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

