import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script pour ajouter le champ isAphasic au modèle User
 * Usage: npm run db:add-is-aphasic
 * ou: tsx prisma/add-is-aphasic.ts
 */

async function addIsAphasic() {
  console.log('🔄 Ajout du champ isAphasic au modèle User...');

  try {
    // Vérifier si la colonne existe déjà
    const checkColumn = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'isAphasic'
    `;

    if (checkColumn.length > 0) {
      console.log('✅ La colonne isAphasic existe déjà.');
    } else {
      // Ajouter la colonne
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD COLUMN "isAphasic" BOOLEAN NOT NULL DEFAULT false
      `;
      console.log('✅ Colonne isAphasic ajoutée avec succès.');
    }

    // Mettre à jour les utilisateurs existants (Calypso et Garance)
    console.log('🔄 Mise à jour des utilisateurs existants...');
    
    // Trouver Calypso et Garance par leur nom (plus sûr que par ID)
    const calypso = await prisma.user.findUnique({ where: { name: 'Calypso' } });
    const garance = await prisma.user.findUnique({ where: { name: 'Garance' } });

    const userIdsToUpdate: number[] = [];
    if (calypso) {
      userIdsToUpdate.push(calypso.id);
      console.log(`   - Calypso trouvé (ID: ${calypso.id})`);
    }
    if (garance) {
      userIdsToUpdate.push(garance.id);
      console.log(`   - Garance trouvé (ID: ${garance.id})`);
    }

    if (userIdsToUpdate.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: userIdsToUpdate } },
        data: { isAphasic: true },
      });
      console.log(`✅ ${userIdsToUpdate.length} utilisateur(s) mis à jour avec isAphasic = true.`);
    } else {
      console.log('⚠️  Aucun utilisateur (Calypso ou Garance) trouvé pour la mise à jour.');
    }

    console.log('✅ Script terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addIsAphasic();

