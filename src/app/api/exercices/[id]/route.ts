import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { isCompletedToday, getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur pour obtenir le resetFrequency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const resetFrequency = user.resetFrequency || 'DAILY';
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(resetFrequency, now);
    const endOfPeriod = resetFrequency === 'DAILY'
      ? startOfDay(addDays(now, 1))
      : startOfDay(addDays(startOfPeriod, 7));
    
    const exercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userId,
      },
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
    });
    
    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }

    // Parser les équipements de manière sécurisée
    let equipmentsParsed: string[] = [];
    try {
      equipmentsParsed = JSON.parse(exercice.equipments || '[]');
    } catch {
      equipmentsParsed = [];
    }

    // Calculer les statuts de complétion
    const weeklyCompletions = exercice.history.map(h => h.completedAt);
    
    // Un exercice est complété dans la période s'il a au moins une entrée dans l'historique de la période
    const completedInPeriod = weeklyCompletions.length > 0;
    
    // Un exercice est complété aujourd'hui si la dernière complétion est aujourd'hui
    const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
    const completedToday = isCompletedToday(completedDate);

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
      equipments: equipmentsParsed,
      bodyparts: exercice.bodyparts.map(eb => eb.bodypart.name),
      category: exercice.category as ExerciceCategory,
      completed: completedInPeriod,
      completedToday: completedToday,
      completedAt: exercice.completedAt,
      pinned: exercice.pinned,
      weeklyCompletions: weeklyCompletions,
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
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const updatedData = await request.json();

    // Vérifier que l'exercice appartient à l'utilisateur
    const existingExercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });

    if (!existingExercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }

    // Valider le nom si fourni
    if (updatedData.name !== undefined && (!updatedData.name || !updatedData.name.trim())) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    // Valider la catégorie si fournie
    if (updatedData.category && !['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(updatedData.category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be UPPER_BODY, LOWER_BODY, STRETCHING, or CORE' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur pour obtenir le resetFrequency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const resetFrequency = user.resetFrequency || 'DAILY';
    const now = new Date();
    const startOfPeriod = getStartOfPeriod(resetFrequency, now);
    const endOfPeriod = resetFrequency === 'DAILY'
      ? startOfDay(addDays(now, 1))
      : startOfDay(addDays(startOfPeriod, 7));

    // Utiliser une transaction pour garantir l'intégrité des données
    const exercice = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'exercice
      const updated = await tx.exercice.update({
        where: { id },
        data: {
          name: updatedData.name !== undefined ? updatedData.name.trim() : undefined,
          descriptionText: updatedData.description?.text !== undefined ? (updatedData.description.text || '') : undefined,
          descriptionComment: updatedData.description?.comment !== undefined ? (updatedData.description.comment || null) : undefined,
          workoutRepeat: updatedData.workout?.repeat,
          workoutSeries: updatedData.workout?.series,
          workoutDuration: updatedData.workout?.duration,
          equipments: updatedData.equipments ? JSON.stringify(updatedData.equipments) : undefined,
          category: updatedData.category as PrismaExerciceCategory | undefined,
        },
      });

      // Mettre à jour les bodyparts si fournis
      if (updatedData.bodyparts && Array.isArray(updatedData.bodyparts)) {
        // Supprimer les anciennes relations
        await tx.exerciceBodypart.deleteMany({
          where: { exerciceId: id },
        });

        // Créer les nouvelles relations en parallèle
        await Promise.all(updatedData.bodyparts.map(async (bodypartName: string) => {
          const bodypart = await tx.bodypart.upsert({
            where: { name: bodypartName },
            update: {},
            create: { name: bodypartName },
          });
          
          await tx.exerciceBodypart.create({
            data: {
              exerciceId: id,
              bodypartId: bodypart.id,
            },
          });
        }));
      }

      return updated;
    });

    // Récupérer l'historique pour calculer les statuts
    const history = await prisma.history.findMany({
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

    // Parser les équipements de manière sécurisée
    let equipmentsParsed: string[] = [];
    try {
      equipmentsParsed = JSON.parse(exercice.equipments || '[]');
    } catch {
      equipmentsParsed = [];
    }

    // Calculer les statuts de complétion
    const weeklyCompletions = history.map(h => h.completedAt);
    
    // Un exercice est complété dans la période s'il a au moins une entrée dans l'historique de la période
    const completedInPeriod = weeklyCompletions.length > 0;
    
    // Un exercice est complété aujourd'hui si la dernière complétion est aujourd'hui
    const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
    const completedToday = isCompletedToday(completedDate);

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
      equipments: equipmentsParsed,
      bodyparts: updatedData.bodyparts || [],
      category: exercice.category as ExerciceCategory,
      completed: completedInPeriod,
      completedToday: completedToday,
      completedAt: exercice.completedAt,
      pinned: exercice.pinned,
      weeklyCompletions: weeklyCompletions,
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
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid exercice id' },
        { status: 400 }
      );
    }

    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier que l'exercice appartient à l'utilisateur
    const existingExercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userId,
      },
    });

    if (!existingExercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }
    
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
