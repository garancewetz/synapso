import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { ExerciceCategory } from '@/app/types/exercice';
import { Prisma, ExerciceCategory as PrismaExerciceCategory } from '@prisma/client';
import { isCompletedToday, isCompletedInPeriod } from '@/app/utils/resetFrequency.utils';

// Types pour les résultats SQL bruts
interface ExerciceRaw {
  id: number;
  name: string;
  descriptionText: string;
  descriptionComment: string | null;
  workoutRepeat: string | null;
  workoutSeries: string | null;
  workoutDuration: string | null;
  equipments: string;
  category: ExerciceCategory;
  userId: number;
  completed: boolean;
  completedAt: Date | null;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BodypartRaw {
  exerciceId: number;
  bodypartId: number;
  bodypart_id: number;
  bodypart_name: string;
  bodypart_color: string;
  bodypart_createdAt: Date;
  bodypart_updatedAt: Date;
}

interface ExerciceWithBodyparts extends ExerciceRaw {
  bodyparts: Array<{ bodypart: { id: number; name: string; color: string; createdAt: Date; updatedAt: Date } }>;
}

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      throw new Error('Prisma client non initialisé');
    }
    
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
    const userExists = await prisma.user.findUnique({
      where: { id: userIdNumber },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: `User with id ${userIdNumber} not found` },
        { status: 404 }
      );
    }

    // Récupérer le resetFrequency de l'utilisateur (avec cast pour contourner le problème de type Prisma)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userResetFrequency = (userExists as any).resetFrequency || 'DAILY';

    const whereClause: { userId: number; category?: ExerciceCategory } = {
      userId: userIdNumber,
    };

    // Filtrer par catégorie si spécifiée
    if (category && ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(category)) {
      whereClause.category = category;
    }

    // Utiliser une requête SQL brute pour contourner le problème de cache PostgreSQL
    let exercicesRaw: ExerciceRaw[];
    try {
      // Construire la requête SQL avec Prisma.sql pour éviter le cache
      let sql: Prisma.Sql;
      
      if (category && ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING', 'CORE'].includes(category)) {
        // Utiliser Prisma.raw pour interpoler la catégorie comme string littérale (sécurisé car validé)
        sql = Prisma.sql`
          SELECT 
            id, name, "descriptionText", "descriptionComment",
            "workoutRepeat", "workoutSeries", "workoutDuration",
            equipments, category, "userId", completed, "completedAt",
            pinned, "createdAt", "updatedAt"
          FROM "Exercice"
          WHERE "userId" = ${userIdNumber} AND category = ${Prisma.raw(`'${category}'`)}
          ORDER BY pinned DESC, id DESC
        `;
      } else {
        sql = Prisma.sql`
          SELECT 
            id, name, "descriptionText", "descriptionComment",
            "workoutRepeat", "workoutSeries", "workoutDuration",
            equipments, category, "userId", completed, "completedAt",
            pinned, "createdAt", "updatedAt"
          FROM "Exercice"
          WHERE "userId" = ${userIdNumber}
          ORDER BY pinned DESC, id DESC
        `;
      }
      
      exercicesRaw = await prisma.$queryRaw(sql) as ExerciceRaw[];
    } catch (error) {
      throw error;
    }

    // Ensuite récupérer les bodyparts séparément via SQL brute
    const exerciceIds = exercicesRaw.map((e: ExerciceRaw) => e.id);
    
    let exerciceBodyparts: Array<{
      exerciceId: number;
      bodypartId: number;
      bodypart: { id: number; name: string; color: string; createdAt: Date; updatedAt: Date };
    }> = [];
    if (exerciceIds.length > 0) {
      try {
        // Utiliser SQL brute pour éviter le cache
        // Construire la liste des IDs pour la clause IN (les IDs sont déjà des nombres, donc sécurisé)
        const idsList = exerciceIds.join(', ');
        const bodypartsSql = `
          SELECT 
            eb."exerciceId",
            eb."bodypartId",
            b.id as "bodypart_id",
            b.name as "bodypart_name",
            b.color as "bodypart_color",
            b."createdAt" as "bodypart_createdAt",
            b."updatedAt" as "bodypart_updatedAt"
          FROM "ExerciceBodypart" eb
          INNER JOIN "Bodypart" b ON eb."bodypartId" = b.id
          WHERE eb."exerciceId" IN (${idsList})
        `;
        
        const bodypartsRaw = await prisma.$queryRawUnsafe(bodypartsSql) as BodypartRaw[];
        
        // Transformer les résultats pour correspondre à la structure attendue
        exerciceBodyparts = bodypartsRaw.map((row: BodypartRaw) => ({
          exerciceId: row.exerciceId,
          bodypartId: row.bodypartId,
          bodypart: {
            id: row.bodypart_id,
            name: row.bodypart_name,
            color: row.bodypart_color,
            createdAt: row.bodypart_createdAt,
            updatedAt: row.bodypart_updatedAt,
          },
        }));
      } catch (error) {
        throw error;
      }
    }

    // Reconstruire la structure avec les bodyparts
    const exercices = exercicesRaw.map(exercice => {
      const exerciceBodypartsFiltered = exerciceBodyparts
        .filter(eb => eb.exerciceId === exercice.id)
        .map(eb => ({ bodypart: eb.bodypart }));
      
      return {
        ...exercice,
        bodyparts: exerciceBodypartsFiltered,
      };
    });

    // Reformater les données
    const formattedExercices = exercices.map((exercice) => {
      try {
        const completedDate = exercice.completedAt ? new Date(exercice.completedAt) : null;
        
        // Utiliser les utilitaires pour calculer completedToday et completedInPeriod
        const completedToday = isCompletedToday(completedDate);
        const completedInPeriod = isCompletedInPeriod(completedDate, userResetFrequency);

        // Parser les équipements
        let equipmentsParsed = [];
        try {
          equipmentsParsed = JSON.parse(exercice.equipments || '[]');
        } catch {
          equipmentsParsed = [];
        }

        // Extraire les noms des bodyparts
        let bodypartsNames: string[] = [];
        try {
          bodypartsNames = (exercice as ExerciceWithBodyparts).bodyparts?.map((eb) => eb.bodypart.name) || [];
        } catch {
          bodypartsNames = [];
        }

        const formatted = {
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
        };

        return formatted;
      } catch (formatError) {
        throw formatError;
      }
    });
    
    return NextResponse.json(formattedExercices);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch exercices', 
        details: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name || 'Unknown',
      },
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

    // Créer l'exercice
    const exercice = await prisma.exercice.create({
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
    const exerciceWithCategory = exercice as typeof exercice & { category: ExerciceCategory };
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
      category: exerciceWithCategory.category,
      completed: exercice.completed,
      completedAt: exercice.completedAt,
      pinned: exercice.pinned,
    };

    return NextResponse.json(formattedExercice, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create exercice' },
      { status: 500 }
    );
  }
}
