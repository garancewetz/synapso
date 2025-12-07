import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgresClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Script pour migrer les données de SQLite vers PostgreSQL
// Usage: 
// 1. Configurez DATABASE_URL pour SQLite dans .env.local
// 2. Configurez DATABASE_URL_POSTGRES pour PostgreSQL dans .env.local
// 3. Exécutez: tsx prisma/migrate-to-postgres.ts

async function migrateToPostgres() {
  const sqliteUrl = process.env.DATABASE_URL_SQLITE || 'file:./prisma/dev.db';
  const postgresUrl = process.env.DATABASE_URL_POSTGRES;

  if (!postgresUrl) {
    console.error('❌ DATABASE_URL_POSTGRES n\'est pas défini dans .env.local');
    console.error('Ajoutez: DATABASE_URL_POSTGRES="postgresql://user:password@host:port/database"');
    process.exit(1);
  }

  console.log('🔄 Début de la migration SQLite → PostgreSQL...');

  // Connexion SQLite (temporaire)
  const sqliteClient = new SQLiteClient({
    datasources: {
      db: {
        url: sqliteUrl,
      },
    },
  });

  // Connexion PostgreSQL
  const postgresClient = new PostgresClient({
    datasources: {
      db: {
        url: postgresUrl,
      },
    },
  });

  try {
    // 1. Migrer Bodyparts
    console.log('📦 Migration des bodyparts...');
    const bodyparts = await sqliteClient.bodypart.findMany();
    for (const bodypart of bodyparts) {
      await postgresClient.bodypart.upsert({
        where: { id: bodypart.id },
        update: {
          name: bodypart.name,
          color: bodypart.color,
        },
        create: {
          id: bodypart.id,
          name: bodypart.name,
          color: bodypart.color,
        },
      });
    }
    console.log(`✅ ${bodyparts.length} bodyparts migrés`);

    // 2. Récupérer l'utilisateur Calypso (par défaut)
    const calypso = await postgresClient.user.findUnique({
      where: { name: 'Calypso' },
    });
    
    if (!calypso) {
      throw new Error('Utilisateur Calypso non trouvé. Veuillez d\'abord créer les utilisateurs.');
    }

    // 3. Migrer Exercices
    console.log('📦 Migration des exercices...');
    const exercices = await sqliteClient.exercice.findMany({
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
    });
    
    for (const exercice of exercices) {
      await postgresClient.exercice.upsert({
        where: { id: exercice.id },
        update: {
          name: exercice.name,
          descriptionText: exercice.descriptionText,
          descriptionComment: exercice.descriptionComment,
          workoutRepeat: exercice.workoutRepeat,
          workoutSeries: exercice.workoutSeries,
          workoutDuration: exercice.workoutDuration,
          equipments: exercice.equipments,
          completed: exercice.completed,
          completedAt: exercice.completedAt,
          userId: calypso.id,
        },
        create: {
          id: exercice.id,
          name: exercice.name,
          descriptionText: exercice.descriptionText,
          descriptionComment: exercice.descriptionComment,
          workoutRepeat: exercice.workoutRepeat,
          workoutSeries: exercice.workoutSeries,
          workoutDuration: exercice.workoutDuration,
          equipments: exercice.equipments,
          completed: exercice.completed,
          completedAt: exercice.completedAt,
          userId: calypso.id,
        },
      });

      // Migrer les relations ExerciceBodypart
      for (const eb of exercice.bodyparts) {
        await postgresClient.exerciceBodypart.upsert({
          where: {
            exerciceId_bodypartId: {
              exerciceId: eb.exerciceId,
              bodypartId: eb.bodypartId,
            },
          },
          update: {},
          create: {
            exerciceId: eb.exerciceId,
            bodypartId: eb.bodypartId,
          },
        });
      }
    }
    console.log(`✅ ${exercices.length} exercices migrés`);

    // 4. Migrer History
    console.log('📦 Migration de l\'historique...');
    const history = await sqliteClient.history.findMany();
    for (const entry of history) {
      await postgresClient.history.upsert({
        where: { id: entry.id },
        update: {
          exerciceId: entry.exerciceId,
          completedAt: entry.completedAt,
        },
        create: {
          id: entry.id,
          exerciceId: entry.exerciceId,
          completedAt: entry.completedAt,
        },
      });
    }
    console.log(`✅ ${history.length} entrées d'historique migrées`);

    // 5. Migrer AphasieItems
    console.log('📦 Migration des items d\'aphasie...');
    const aphasieItems = await sqliteClient.aphasieItem.findMany();
    for (const item of aphasieItems) {
      await postgresClient.aphasieItem.upsert({
        where: { id: item.id },
        update: {
          quote: item.quote,
          meaning: item.meaning,
          date: item.date,
          comment: item.comment,
        },
        create: {
          id: item.id,
          quote: item.quote,
          meaning: item.meaning,
          date: item.date,
          comment: item.comment,
        },
      });
    }
    console.log(`✅ ${aphasieItems.length} items d'aphasie migrés`);

    console.log('✨ Migration terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

migrateToPostgres();

