import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const exercices = await prisma.exercice.findMany({
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Reformater les données pour correspondre à l'ancien format
    const formattedExercices = exercices.map((exercice: any) => {
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

      return {
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
        completed: completedToday,
        completedAt: exercice.completedAt,
      };
    });

    return NextResponse.json(formattedExercices);
  } catch (error) {
    console.error('Error fetching exercices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Créer l'exercice
    const exercice = await prisma.exercice.create({
      data: {
        name: data.name,
        descriptionText: data.description.text,
        descriptionComment: data.description.comment,
        workoutRepeat: data.workout.repeat,
        workoutSeries: data.workout.series,
        workoutDuration: data.workout.duration,
        equipments: JSON.stringify(data.equipments),
      },
    });

    // Créer les relations avec les bodyparts
    if (data.bodyparts && Array.isArray(data.bodyparts)) {
      for (const bodypartName of data.bodyparts) {
        // Trouver le bodypart par son nom
        const bodypart = await prisma.bodypart.findUnique({
          where: { name: bodypartName },
        });

        if (bodypart) {
          await prisma.exerciceBodypart.create({
            data: {
              exerciceId: exercice.id,
              bodypartId: bodypart.id,
            },
          });
        }
      }
    }

    // Récupérer l'exercice avec ses relations
    const exerciceWithRelations = await prisma.exercice.findUnique({
      where: { id: exercice.id },
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

    return NextResponse.json(formattedExercice, { status: 201 });
  } catch (error) {
    console.error('Error creating exercice:', error);
    return NextResponse.json(
      { error: 'Failed to create exercice' },
      { status: 500 }
    );
  }
}

