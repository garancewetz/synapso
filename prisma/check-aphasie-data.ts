import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAphasieData() {
  try {
    console.log('🔍 Vérification de l\'état de la base de données...\n');

    // 1. Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
    console.log('👥 Utilisateurs trouvés:');
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Nom: ${user.name}`);
    });

    const calypso = users.find(u => u.name === 'Calypso');
    if (!calypso) {
      console.log('\n❌ Calypso n\'existe pas dans la base de données!');
      return;
    }
    console.log(`\n✅ Calypso trouvé avec ID: ${calypso.id}\n`);

    // 2. Vérifier les citations
    // Vérifier si la colonne userId existe
    try {
      const testItem = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'AphasieItem' AND column_name = 'userId'
      `;
      
      if (!testItem || (testItem as any[]).length === 0) {
        console.log('\n❌ La colonne userId n\'existe pas dans AphasieItem!');
        console.log('   Vous devez appliquer la migration: npm run db:migrate');
        return;
      }
      console.log('✅ La colonne userId existe dans AphasieItem');
    } catch (error) {
      console.log('⚠️  Erreur lors de la vérification de la colonne userId:', error);
    }

    const allItems = await prisma.aphasieItem.findMany({
      include: { user: true },
    });
    console.log(`📝 Total de citations: ${allItems.length}`);
    
    const itemsWithoutUser = allItems.filter(item => !item.userId);
    const itemsWithCalypso = allItems.filter(item => item.userId === calypso.id);
    const itemsWithOtherUsers = allItems.filter(item => item.userId && item.userId !== calypso.id);

    console.log(`  - Sans userId: ${itemsWithoutUser.length}`);
    console.log(`  - Avec Calypso (ID ${calypso.id}): ${itemsWithCalypso.length}`);
    console.log(`  - Avec d'autres utilisateurs: ${itemsWithOtherUsers.length}`);

    if (itemsWithoutUser.length > 0) {
      console.log('\n⚠️  Citations sans userId trouvées, attribution à Calypso...');
      await prisma.aphasieItem.updateMany({
        where: { userId: null },
        data: { userId: calypso.id },
      });
      console.log(`✅ ${itemsWithoutUser.length} citations attribuées à Calypso`);
    }

    // 3. Vérifier les challenges
    const allChallenges = await prisma.aphasieChallenge.findMany({
      include: { user: true },
    });
    console.log(`\n🎯 Total de challenges: ${allChallenges.length}`);
    
    const challengesWithoutUser = allChallenges.filter(c => !c.userId);
    const challengesWithCalypso = allChallenges.filter(c => c.userId === calypso.id);
    const challengesWithOtherUsers = allChallenges.filter(c => c.userId && c.userId !== calypso.id);

    console.log(`  - Sans userId: ${challengesWithoutUser.length}`);
    console.log(`  - Avec Calypso (ID ${calypso.id}): ${challengesWithCalypso.length}`);
    console.log(`  - Avec d'autres utilisateurs: ${challengesWithOtherUsers.length}`);

    if (challengesWithoutUser.length > 0) {
      console.log('\n⚠️  Challenges sans userId trouvés, attribution à Calypso...');
      await prisma.aphasieChallenge.updateMany({
        where: { userId: null },
        data: { userId: calypso.id },
      });
      console.log(`✅ ${challengesWithoutUser.length} challenges attribués à Calypso`);
    }

    // 4. Afficher quelques exemples de citations de Calypso
    const calypsoItems = await prisma.aphasieItem.findMany({
      where: { userId: calypso.id },
      take: 5,
      orderBy: { id: 'asc' },
    });

    if (calypsoItems.length > 0) {
      console.log(`\n📋 Exemples de citations de Calypso (${calypsoItems.length} affichées sur ${itemsWithCalypso.length}):`);
      calypsoItems.forEach(item => {
        console.log(`  - ID: ${item.id}, Citation: "${item.quote.substring(0, 50)}..."`);
      });
    } else {
      console.log('\n⚠️  Aucune citation trouvée pour Calypso');
    }

    console.log('\n✅ Vérification terminée!');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAphasieData();

