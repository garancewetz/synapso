import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { isCompletedToday, getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { startOfWeek, addDays, startOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

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

    // Vérifier que l'utilisateur existe et récupérer son resetFrequency
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
      select: { id: true, resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with id ${userIdNumber} not found` },
        { status: 404 }
      );
    }

    // Construire le filtre
    const whereClause: { userId: number; category?: PrismaExerciceCategory } = {
      userId: userIdNumber,
    };

    if (category && ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(category)) {
      whereClause.category = category as PrismaExerciceCategory;
    }

    // Calculer la période de réinitialisation
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(user.resetFrequency, now);
    const endOfPeriod = user.resetFrequency === 'DAILY'
      ? startOfDay(addDays(now, 1))
      : startOfDay(addDays(startOfPeriod, 7));

    // Utiliser Prisma Query Builder natif
    const exercices = await prisma.exercice.findMany({
      where: whereClause,
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
        history: {
          where: {
            completedAt: {
              gte: startOfPeriod,
              lt: endOfPeriod,
            },
          },
          orderBy: {
            completedAt: 'asc',
          },
        },
      },
      orderBy: [
        { pinned: 'desc' },
        { id: 'desc' },
      ],
    });

    // Reformater les données
    const formattedExercices = exercices.map((exercice) => {
      // Extraire les dates de complétion de la période (pour mode WEEKLY)
      const weeklyCompletions = exercice.history.map((h) => h.completedAt);
      
      // Un exercice est complété dans la période s'il a au moins une entrée dans l'historique de la période
      const completedInPeriod = weeklyCompletions.length > 0;
      
      // Un exercice est complété aujourd'hui si la dernière complétion est aujourd'hui
      const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
      const completedToday = isCompletedToday(completedDate);

      // Parser les équipements
      let equipmentsParsed: string[] = [];
      try {
        equipmentsParsed = JSON.parse(exercice.equipments || '[]');
      } catch {
        equipmentsParsed = [];
      }

      // Extraire les noms des bodyparts
      const bodypartsNames = exercice.bodyparts.map((eb) => eb.bodypart.name);

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
        equipments: equipmentsParsed,
        bodyparts: bodypartsNames,
        category: exercice.category as ExerciceCategory,
        completed: completedInPeriod,
        completedToday: completedToday,
        completedAt: exercice.completedAt,
        pinned: exercice.pinned ?? false,
        weeklyCompletions: weeklyCompletions,
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
  const authError = await requireAuth(request);
  if (authError) return authError;

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

    // Valider le nom
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    // Valider la catégorie
    const category = (data.category || 'UPPER_BODY') as ExerciceCategory;
    if (!['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be UPPER_BODY, LOWER_BODY, STRETCHING, or CORE' },
        { status: 400 }
      );
    }

    // Utiliser une transaction pour garantir l'intégrité des données
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'exercice
      const exercice = await tx.exercice.create({
        data: {
          name: data.name.trim(),
          descriptionText: data.description?.text || '',
          descriptionComment: data.description?.comment || null,
          workoutRepeat: data.workout?.repeat || null,
          workoutSeries: data.workout?.series || null,
          workoutDuration: data.workout?.duration || null,
          equipments: JSON.stringify(data.equipments || []),
          category: category as PrismaExerciceCategory,
          userId: userIdNumber,
        },
      });

      // Créer les relations bodyparts en parallèle si fournies
      if (data.bodyparts && Array.isArray(data.bodyparts) && data.bodyparts.length > 0) {
        await Promise.all(data.bodyparts.map(async (bodypartName: string) => {
          // Trouver ou créer le bodypart
          const bodypart = await tx.bodypart.upsert({
            where: { name: bodypartName },
            update: {},
            create: { name: bodypartName },
          });
          
          // Créer la relation
          await tx.exerciceBodypart.create({
            data: {
              exerciceId: exercice.id,
              bodypartId: bodypart.id,
            },
          });
        }));
      }

      return exercice;
    });

    // Reformater les données
    const formattedExercice = {
      id: result.id,
      name: result.name,
      description: {
        text: result.descriptionText,
        comment: result.descriptionComment,
      },
      workout: {
        repeat: result.workoutRepeat,
        series: result.workoutSeries,
        duration: result.workoutDuration,
      },
      equipments: JSON.parse(result.equipments),
      bodyparts: data.bodyparts || [],
      category: result.category as ExerciceCategory,
      completed: result.completed,
      completedAt: result.completedAt,
      pinned: result.pinned,
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
