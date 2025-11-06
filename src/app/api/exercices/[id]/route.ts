import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const exercice = await prisma.exercice.findUnique({
      where: { id },
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
    });
    
    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }

    // Reformater les données pour correspondre à l'ancien format
    const formattedExercice = {
      id: exercice.id,
      name: exercice.name,
      description: {
        text: exercice.descriptionText,
        comment: exercice.descriptionComment,
      },
      workout: {
        repeat: exercice.workoutRepeat,
        series: exercice.workoutSeries,
        duration: exercice.workoutDuration,
      },
      equipments: JSON.parse(exercice.equipments),
      bodyparts: exercice.bodyparts.map((eb: any) => ({
        id: eb.bodypart.id,
        name: eb.bodypart.name,
        color: eb.bodypart.color,
      })),
      completed: exercice.completed,
      completedAt: exercice.completedAt,
    };

    return NextResponse.json(formattedExercice);
  } catch (error) {
    console.error('Error fetching exercice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const updatedData = await request.json();

    // Mettre à jour l'exercice
    const exercice = await prisma.exercice.update({
      where: { id },
      data: {
        name: updatedData.name,
        descriptionText: updatedData.description?.text,
        descriptionComment: updatedData.description?.comment,
        workoutRepeat: updatedData.workout?.repeat,
        workoutSeries: updatedData.workout?.series,
        workoutDuration: updatedData.workout?.duration,
        equipments: updatedData.equipments ? JSON.stringify(updatedData.equipments) : undefined,
      },
    });

    // Mettre à jour les relations bodyparts si fourni
    if (updatedData.bodyparts && Array.isArray(updatedData.bodyparts)) {
      // Supprimer les relations existantes
      await prisma.exerciceBodypart.deleteMany({
        where: { exerciceId: id },
      });

      // Créer les nouvelles relations
      for (const bodypartName of updatedData.bodyparts) {
        const bodypart = await prisma.bodypart.findUnique({
          where: { name: bodypartName },
        });

        if (bodypart) {
          await prisma.exerciceBodypart.create({
            data: {
              exerciceId: id,
              bodypartId: bodypart.id,
            },
          });
        }
      }
    }

    // Récupérer l'exercice mis à jour avec ses relations
    const exerciceWithRelations = await prisma.exercice.findUnique({
      where: { id },
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
    });

    // Reformater les données pour correspondre à l'ancien format
    const formattedExercice = {
      id: exerciceWithRelations!.id,
      name: exerciceWithRelations!.name,
      description: {
        text: exerciceWithRelations!.descriptionText,
        comment: exerciceWithRelations!.descriptionComment,
      },
      workout: {
        repeat: exerciceWithRelations!.workoutRepeat,
        series: exerciceWithRelations!.workoutSeries,
        duration: exerciceWithRelations!.workoutDuration,
      },
      equipments: JSON.parse(exerciceWithRelations!.equipments),
      bodyparts: exerciceWithRelations!.bodyparts.map((eb: any) => ({
        id: eb.bodypart.id,
        name: eb.bodypart.name,
        color: eb.bodypart.color,
      })),
      completed: exerciceWithRelations!.completed,
      completedAt: exerciceWithRelations!.completedAt,
    };

    return NextResponse.json(formattedExercice);
  } catch (error) {
    console.error('Error updating exercice:', error);
    return NextResponse.json(
      { error: 'Failed to update exercice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    await prisma.exercice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercice:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercice' },
      { status: 500 }
    );
  }
}

