import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExerciceCategory } from '@/types/exercice';

interface ExerciceFromDB {
  id: number;
  name: string;
  descriptionText: string;
  descriptionComment: string | null;
  workoutRepeat: number | null;
  workoutSeries: number | null;
  workoutDuration: string | null;
  equipments: string;
  category: ExerciceCategory;
  completed: boolean;
  completedAt: Date | null;
  pinned: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category') as ExerciceCategory | null;
    
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

    const whereClause: { userId: number; category?: ExerciceCategory } = {
      userId: userIdNumber,
    };

    // Filtrer par catégorie si spécifiée
    if (category && ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'].includes(category)) {
      whereClause.category = category;
    }

    const exercices = await prisma.exercice.findMany({
      where: whereClause,
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { id: 'asc' },
      ],
    });

    // Reformater les données
    const formattedExercices = exercices.map((exercice) => {
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
        equipments: JSON.parse(exercice.equipments || '[]'),
        bodyparts: exercice.bodyparts?.map((eb: { bodypart: { name: string } }) => eb.bodypart.name) || [],
        category: exercice.category,
        completed: completedToday,
        completedAt: exercice.completedAt,
        pinned: exercice.pinned ?? false,
      };
    });

    return NextResponse.json(formattedExercices);
  } catch (error) {
    console.error('Error fetching exercices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercices', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(data.userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    // Valider la catégorie
    const category = data.category || 'UPPER_BODY';
    if (!['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be UPPER_BODY, LOWER_BODY, or STRETCHING' },
        { status: 400 }
      );
    }

    // Créer l'exercice
    const exercice = await prisma.exercice.create({
      data: {
        name: data.name,
        descriptionText: data.description.text,
        descriptionComment: data.description.comment,
        workoutRepeat: data.workout.repeat,
        workoutSeries: data.workout.series,
        workoutDuration: data.workout.duration,
        equipments: JSON.stringify(data.equipments || []),
        category: category,
        userId: userIdNumber,
      },
    });

    // Créer les relations bodyparts si fournies
    if (data.bodyparts && Array.isArray(data.bodyparts) && data.bodyparts.length > 0) {
      for (const bodypartName of data.bodyparts) {
        // Trouver ou créer le bodypart
        const bodypart = await prisma.bodypart.upsert({
          where: { name: bodypartName },
          update: {},
          create: { name: bodypartName, color: 'gray' },
        });
        
        // Créer la relation
        await prisma.exerciceBodypart.create({
          data: {
            exerciceId: exercice.id,
            bodypartId: bodypart.id,
          },
        });
      }
    }

    // Reformater les données
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
      bodyparts: data.bodyparts || [],
      category: exercice.category,
      completed: exercice.completed,
      completedAt: exercice.completedAt,
      pinned: exercice.pinned,
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
