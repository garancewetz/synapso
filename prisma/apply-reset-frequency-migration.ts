import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔍 Vérification de l\'état actuel de la base de données...');

    // Vérifier si l'enum existe déjà
    const enumExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'ResetFrequency'
      ) as exists;
    `;

    if (!enumExists[0]?.exists) {
      console.log('📝 Création de l\'enum ResetFrequency...');
      await prisma.$executeRaw`CREATE TYPE "ResetFrequency" AS ENUM ('DAILY', 'WEEKLY');`;
      console.log('✅ Enum créé avec succès');
    } else {
      console.log('ℹ️  L\'enum ResetFrequency existe déjà');
    }

    // Vérifier si la colonne existe déjà
    const columnExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'resetFrequency'
      ) as exists;
    `;

    if (!columnExists[0]?.exists) {
      console.log('📝 Ajout de la colonne resetFrequency à la table User...');
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "resetFrequency" "ResetFrequency" NOT NULL DEFAULT 'DAILY';
      `;
      console.log('✅ Colonne ajoutée avec succès');
    } else {
      console.log('ℹ️  La colonne resetFrequency existe déjà');
    }

    // Vérifier que tout fonctionne
    const test = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        resetFrequency: true,
      },
    });

    console.log('✅ Migration appliquée avec succès !');
    console.log('📊 Test de lecture:', test ? `Utilisateur trouvé: ${test.name} (resetFrequency: ${test.resetFrequency})` : 'Aucun utilisateur trouvé');

    // Marquer la migration comme appliquée dans la table _prisma_migrations
    const migrationName = '20250120120000_add_reset_frequency_to_user';
    try {
      const migrationExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1 
          FROM "_prisma_migrations" 
          WHERE migration_name = ${migrationName}
        ) as exists;
      `;

      if (!migrationExists[0]?.exists) {
        console.log('📝 Enregistrement de la migration dans _prisma_migrations...');
        try {
          // Essayer d'insérer la migration
          await prisma.$executeRaw`
            INSERT INTO "_prisma_migrations" (migration_name, applied_steps_count, started_at, finished_at)
            VALUES (${migrationName}, 1, NOW(), NOW());
          `;
          console.log('✅ Migration enregistrée');
        } catch (insertError: any) {
          // Si ça échoue, vérifier si elle existe déjà (race condition)
          const checkAgain = await prisma.$queryRaw<Array<{ exists: boolean }>>`
            SELECT EXISTS (
              SELECT 1 
              FROM "_prisma_migrations" 
              WHERE migration_name = ${migrationName}
            ) as exists;
          `;
          if (checkAgain[0]?.exists) {
            console.log('ℹ️  La migration est déjà enregistrée');
          } else {
            console.warn('⚠️  Impossible d\'enregistrer la migration (non bloquant):', insertError.message);
          }
        }
      } else {
        console.log('ℹ️  La migration est déjà enregistrée');
      }
    } catch (error: any) {
      // Si la table _prisma_migrations n'existe pas, ce n'est pas grave
      if (error?.code !== '42P01') {
        console.warn('⚠️  Impossible d\'enregistrer la migration (non bloquant):', error.message);
      }
    }

    console.log('\n🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

