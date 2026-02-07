import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { ExerciceCategory } from '@/app/types/exercice';
import { ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';

type ExerciceWithArchived = {
  archived?: boolean;
  archivedAt?: Date | null;
  [key: string]: unknown;
};

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie (gère l'impersonation admin)
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as ExerciceCategory | null;
    const equipmentsParam = searchParams.get('equipments');
    
    // Parser les équipements depuis le paramètre URL (format: "Lit/Tapis,Chaise" ou "Lit/Tapis")
    const selectedEquipments = equipmentsParam
      ? equipmentsParam.split(',').map(eq => decodeURIComponent(eq).trim()).filter(Boolean)
      : [];

    // Vérifier que l'utilisateur existe et récupérer son resetFrequency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, resetFrequency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User with id ${userId} not found` },
        { status: 404 }
      );
    }

    // Récupérer le paramètre includeArchived
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Construire le filtre
    const whereClause: {
      userId: number;
      category?: PrismaExerciceCategory;
      archived?: boolean;
    } = {
      userId: userId,
    };

    if (category && ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(category)) {
      whereClause.category = category as PrismaExerciceCategory;
    }

    // Filtrer les exercices archivés par défaut (sauf si includeArchived=true)
    if (!includeArchived) {
      whereClause.archived = false;
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

    // Reformater les données et filtrer par équipements si nécessaire
    const formattedExercices = exercices
      .map((exercice) => {
        // Extraire les dates de complétion de la période (pour mode WEEKLY)
        const weeklyCompletions = exercice.history.map((h) => h.completedAt);
        
        // Un exercice est complété dans la période s'il a au moins une entrée dans l'historique de la période
        const completedInPeriod = weeklyCompletions.length > 0;
        
        // Un exercice est complété aujourd'hui si il y a une entrée dans l'historique pour aujourd'hui
        const startOfToday = startOfDay(now);
        const endOfToday = startOfDay(addDays(now, 1));
        const hasTodayHistory = exercice.history.some(
          (h) => h.completedAt >= startOfToday && h.completedAt < endOfToday
        );
        const completedToday = hasTodayHistory;

        // Parser les équipements
        let equipmentsParsed: string[] = [];
        try {
          equipmentsParsed = JSON.parse(exercice.equipments || '[]');
        } catch {
          equipmentsParsed = [];
        }

        // Extraire les noms des bodyparts
        const bodypartsNames = exercice.bodyparts.map((eb) => eb.bodypart.name);

        // Les médias sont déjà un objet JSON (type Json de Prisma)
        const mediaParsed = exercice.media ?? null;

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
          media: mediaParsed,
          archived: (exercice as ExerciceWithArchived).archived ?? false,
          archivedAt: (exercice as ExerciceWithArchived).archivedAt,
        };
      })
      // Filtrer par équipements si spécifié (au moins un équipement doit correspondre)
      .filter((exercice) => {
        if (selectedEquipments.length === 0) {
          return true;
        }
        // Vérifier si l'exercice contient au moins un des équipements sélectionnés
        return selectedEquipments.some(selectedEq => exercice.equipments.includes(selectedEq));
      });
    
    return NextResponse.json(formattedExercices);
  } catch (error) {
    logError('Error fetching exercices', error);
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
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Constantes de validation
    const MAX_EXERCICE_NAME_LENGTH = 200;
    const MAX_DESCRIPTION_LENGTH = 5000;
    const MAX_WORKOUT_FIELD_LENGTH = 500;

    // Valider le nom
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    const trimmedName = data.name.trim();
    if (trimmedName.length > MAX_EXERCICE_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Le nom de l'exercice ne peut pas dépasser ${MAX_EXERCICE_NAME_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Valider la longueur de la description
    if (data.description?.text && data.description.text.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `La description ne peut pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (data.description?.comment && data.description.comment.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Le commentaire ne peut pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Valider les champs workout
    if (data.workout?.repeat && data.workout.repeat.length > MAX_WORKOUT_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `Le champ repeat ne peut pas dépasser ${MAX_WORKOUT_FIELD_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (data.workout?.series && data.workout.series.length > MAX_WORKOUT_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `Le champ series ne peut pas dépasser ${MAX_WORKOUT_FIELD_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (data.workout?.duration && data.workout.duration.length > MAX_WORKOUT_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `Le champ duration ne peut pas dépasser ${MAX_WORKOUT_FIELD_LENGTH} caractères` },
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
          name: trimmedName,
          descriptionText: data.description?.text || '',
          descriptionComment: data.description?.comment || null,
          workoutRepeat: data.workout?.repeat || null,
          workoutSeries: data.workout?.series || null,
          workoutDuration: data.workout?.duration || null,
          equipments: JSON.stringify(data.equipments || []),
          category: category as PrismaExerciceCategory,
          userId: userId,
          media: data.media ?? null,
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

    // Les médias sont déjà un objet JSON (type Json de Prisma)
    const mediaParsed = result.media ?? null;

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
      media: mediaParsed,
      archived: (result as ExerciceWithArchived).archived ?? false,
      archivedAt: (result as ExerciceWithArchived).archivedAt,
    };

    return NextResponse.json(formattedExercice, { status: 201 });
  } catch (error) {
    logError('Error creating exercice', error);
    return NextResponse.json(
      { error: 'Failed to create exercice' },
      { status: 500 }
    );
  }
}
