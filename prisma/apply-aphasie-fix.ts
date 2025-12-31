import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyAphasieFix() {
  try {
    console.log('🔧 Application du correctif pour les citations aphasie...\n');

    // 1. Trouver Calypso
    const calypso = await prisma.user.findUnique({
      where: { name: 'Calypso' },
    });

    if (!calypso) {
      console.log('❌ Calypso non trouvé dans la base de données');
      return;
    }

    console.log(`✅ Calypso trouvé avec ID: ${calypso.id}\n`);

    // 2. Vérifier et ajouter userId à AphasieItem si nécessaire
    try {
      const itemsWithoutUser = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count 
        FROM "AphasieItem" 
        WHERE "userId" IS NULL
      `;

      const count = Number(itemsWithoutUser[0]?.count || 0);
      
      if (count > 0) {
        console.log(`📝 Attribution de ${count} citations à Calypso...`);
        await prisma.$executeRaw`
          UPDATE "AphasieItem" 
          SET "userId" = ${calypso.id} 
          WHERE "userId" IS NULL
        `;
        console.log('✅ Citations attribuées\n');
      } else {
        console.log('✅ Toutes les citations ont déjà un userId\n');
      }
    } catch (error: any) {
      // Si la colonne n'existe pas, l'ajouter
      if (error.code === '42703' || error.message?.includes('column "userId" does not exist')) {
        console.log('📝 Ajout de la colonne userId à AphasieItem...');
        await prisma.$executeRaw`ALTER TABLE "AphasieItem" ADD COLUMN "userId" INTEGER`;
        await prisma.$executeRaw`
          UPDATE "AphasieItem" 
          SET "userId" = ${calypso.id} 
          WHERE "userId" IS NULL
        `;
        await prisma.$executeRaw`ALTER TABLE "AphasieItem" ALTER COLUMN "userId" SET NOT NULL`;
        console.log('✅ Colonne userId ajoutée et citations attribuées\n');
      } else {
        throw error;
      }
    }

    // 3. Vérifier si la table AphasieChallenge existe
    try {
      const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'AphasieChallenge'
        ) as exists
      `;

      if (!tableExists[0]?.exists) {
        console.log('⚠️  La table AphasieChallenge n\'existe pas encore');
        console.log('   Elle sera créée lors de la prochaine synchronisation du schéma\n');
      } else {
        // Vérifier et ajouter userId à AphasieChallenge si nécessaire
        try {
          const challengesWithoutUser = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count 
            FROM "AphasieChallenge" 
            WHERE "userId" IS NULL
          `;

          const count = Number(challengesWithoutUser[0]?.count || 0);
          
          if (count > 0) {
            console.log(`🎯 Attribution de ${count} challenges à Calypso...`);
            await prisma.$executeRaw`
              UPDATE "AphasieChallenge" 
              SET "userId" = ${calypso.id} 
              WHERE "userId" IS NULL
            `;
            console.log('✅ Challenges attribués\n');
          } else {
            console.log('✅ Tous les challenges ont déjà un userId\n');
          }
        } catch (error: any) {
          // Si la colonne n'existe pas, l'ajouter
          if (error.code === '42703' || error.message?.includes('column "userId" does not exist')) {
            console.log('📝 Ajout de la colonne userId à AphasieChallenge...');
            await prisma.$executeRaw`ALTER TABLE "AphasieChallenge" ADD COLUMN "userId" INTEGER`;
            await prisma.$executeRaw`
              UPDATE "AphasieChallenge" 
              SET "userId" = ${calypso.id} 
              WHERE "userId" IS NULL
            `;
            await prisma.$executeRaw`ALTER TABLE "AphasieChallenge" ALTER COLUMN "userId" SET NOT NULL`;
            console.log('✅ Colonne userId ajoutée et challenges attribués\n');
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('⚠️  La table AphasieChallenge n\'existe pas encore');
        console.log('   Elle sera créée lors de la prochaine synchronisation du schéma\n');
      } else {
        throw error;
      }
    }

    // 4. Vérifier les résultats
    console.log('📊 Vérification des données...\n');

    const calypsoItems = await prisma.aphasieItem.findMany({
      where: { userId: calypso.id },
    });

    console.log(`✅ Citations de Calypso: ${calypsoItems.length}`);

    // Vérifier les challenges seulement si la table existe
    try {
      const calypsoChallenges = await prisma.aphasieChallenge.findMany({
        where: { userId: calypso.id },
      });
      console.log(`✅ Challenges de Calypso: ${calypsoChallenges.length}`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log('⚠️  Table AphasieChallenge non disponible (sera créée avec db:push)');
      }
    }

    if (calypsoItems.length > 0) {
      console.log('\n📝 Exemples de citations:');
      calypsoItems.slice(0, 3).forEach(item => {
        console.log(`   - "${item.quote.substring(0, 50)}..."`);
      });
    } else {
      console.log('\n⚠️  Aucune citation trouvée pour Calypso');
    }

    console.log('\n✅ Correctif appliqué avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'application du correctif:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyAphasieFix();

