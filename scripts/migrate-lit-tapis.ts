/**
 * Script de migration pour fusionner "Lit" et "Tapis" en "Lit/Tapis"
 * 
 * Usage: 
 *   - Mode dry-run (test sans modification) : npx tsx scripts/migrate-lit-tapis.ts --dry-run
 *   - Mode réel (modifie la base) : npx tsx scripts/migrate-lit-tapis.ts
 * 
 * ⚠️ RECOMMANDATION : Faire un backup avant avec `npm run db:backup`
 */

import { PrismaClient } from '@prisma/client';

const getDatabaseUrl = (): string | null => {
  // Essayer d'abord les variables d'environnement
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (process.env.DATABASE_URL_DEV) {
    return process.env.DATABASE_URL_DEV;
  }
  return null;
};

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL ou DATABASE_URL_DEV doit être défini dans les variables d\'environnement ou dans le fichier .env'
  );
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function migrateLitTapis() {
  // Vérifier le mode dry-run
  const isDryRun = process.argv.includes('--dry-run');
  
  try {
    if (isDryRun) {
      console.log('🔍 MODE DRY-RUN (test sans modification)\n');
    } else {
      console.log('⚠️  MODE RÉEL - Les modifications seront appliquées à la base de données\n');
      console.log('💡 Astuce : Utilisez --dry-run pour tester d\'abord\n');
    }
    
    console.log('🔄 Début de la migration Lit/Tapis...\n');

    // Récupérer tous les exercices
    const exercices = await prisma.exercice.findMany({
      select: {
        id: true,
        name: true,
        equipments: true,
      },
    });

    console.log(`📊 ${exercices.length} exercices trouvés\n`);

    let updatedCount = 0;
    let totalReplacements = 0;
    const changes: Array<{ id: number; name: string; before: string[]; after: string[] }> = [];

    // Parcourir tous les exercices
    for (const exercice of exercices) {
      try {
        // Parser les équipements
        const equipments = JSON.parse(exercice.equipments || '[]') as string[];
        
        // Vérifier si "Lit" ou "Tapis" sont présents
        const hasLit = equipments.includes('Lit');
        const hasTapis = equipments.includes('Tapis');
        
        if (hasLit || hasTapis) {
          // Créer un nouveau tableau sans "Lit" et "Tapis"
          const filteredEquipments = equipments.filter(
            eq => eq !== 'Lit' && eq !== 'Tapis'
          );
          
          // Ajouter "Lit/Tapis" si pas déjà présent
          if (!filteredEquipments.includes('Lit/Tapis')) {
            filteredEquipments.push('Lit/Tapis');
          }
          
          // Stocker le changement pour affichage
          changes.push({
            id: exercice.id,
            name: exercice.name,
            before: [...equipments],
            after: [...filteredEquipments],
          });
          
          // Mettre à jour l'exercice seulement si pas en mode dry-run
          if (!isDryRun) {
            await prisma.exercice.update({
              where: { id: exercice.id },
              data: {
                equipments: JSON.stringify(filteredEquipments),
              },
            });
          }
          
          updatedCount++;
          const replacements = (hasLit ? 1 : 0) + (hasTapis ? 1 : 0);
          totalReplacements += replacements;
          
          console.log(`${isDryRun ? '🔍' : '✅'} Exercice "${exercice.name}" (ID: ${exercice.id})`);
          if (hasLit) console.log(`   - "Lit" → "Lit/Tapis"`);
          if (hasTapis) console.log(`   - "Tapis" → "Lit/Tapis"`);
          console.log(`   Avant: [${equipments.join(', ')}]`);
          console.log(`   Après: [${filteredEquipments.join(', ')}]`);
        }
      } catch (error) {
        console.error(`❌ Erreur pour l'exercice ${exercice.id} (${exercice.name}):`, error);
      }
    }

    console.log(`\n${isDryRun ? '🔍' : '✨'} Migration ${isDryRun ? 'simulée' : 'terminée'} !`);
    console.log(`   - ${updatedCount} exercices ${isDryRun ? 'seraient mis à jour' : 'mis à jour'}`);
    console.log(`   - ${totalReplacements} remplacements ${isDryRun ? 'seraient effectués' : 'effectués'}`);
    console.log(`   - Tous les "Lit" et "Tapis" ${isDryRun ? 'seraient fusionnés' : 'ont été fusionnés'} en "Lit/Tapis"\n`);
    
    if (isDryRun) {
      console.log('💡 Pour appliquer réellement les changements, relancez sans --dry-run\n');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateLitTapis()
  .then(() => {
    console.log('✅ Migration réussie');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

