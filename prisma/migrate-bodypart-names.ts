/**
 * Script de migration pour renommer les bodyparts
 * - "Nuque / Cervicales" → "Cou & Nuque"
 * - "Epaules" → "Épaules" (normalisation des accents)
 * 
 * Usage: npx tsx prisma/migrate-bodypart-names.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RENAMES: { from: string; to: string }[] = [
  { from: 'Nuque / Cervicales', to: 'Cou & Nuque' },
  { from: 'Epaules', to: 'Épaules' },
];

async function main() {
  console.log('🔄 Migration des noms de bodyparts...\n');

  for (const rename of RENAMES) {
    // Vérifier si l'ancien nom existe
    const oldBodypart = await prisma.bodypart.findUnique({
      where: { name: rename.from },
    });

    if (!oldBodypart) {
      console.log(`⏭️  "${rename.from}" non trouvé en base, skip.`);
      continue;
    }

    // Vérifier si le nouveau nom existe déjà
    const newBodypart = await prisma.bodypart.findUnique({
      where: { name: rename.to },
    });

    if (newBodypart) {
      // Le nouveau nom existe déjà, on doit fusionner
      console.log(`⚠️  "${rename.to}" existe déjà. Fusion des exercices...`);
      
      // Récupérer tous les exercices liés à l'ancien bodypart
      const exerciceLinks = await prisma.exerciceBodypart.findMany({
        where: { bodypartId: oldBodypart.id },
      });

      for (const link of exerciceLinks) {
        // Vérifier si le lien existe déjà avec le nouveau bodypart
        const existingLink = await prisma.exerciceBodypart.findUnique({
          where: {
            exerciceId_bodypartId: {
              exerciceId: link.exerciceId,
              bodypartId: newBodypart.id,
            },
          },
        });

        if (!existingLink) {
          // Créer le nouveau lien
          await prisma.exerciceBodypart.create({
            data: {
              exerciceId: link.exerciceId,
              bodypartId: newBodypart.id,
            },
          });
        }

        // Supprimer l'ancien lien
        await prisma.exerciceBodypart.delete({
          where: {
            exerciceId_bodypartId: {
              exerciceId: link.exerciceId,
              bodypartId: oldBodypart.id,
            },
          },
        });
      }

      // Supprimer l'ancien bodypart
      await prisma.bodypart.delete({
        where: { id: oldBodypart.id },
      });

      console.log(`✅ "${rename.from}" fusionné avec "${rename.to}"`);
    } else {
      // Simple renommage
      await prisma.bodypart.update({
        where: { id: oldBodypart.id },
        data: { name: rename.to },
      });

      console.log(`✅ "${rename.from}" renommé en "${rename.to}"`);
    }
  }

  // Afficher l'état actuel des bodyparts
  console.log('\n📋 Bodyparts actuels en base :');
  const allBodyparts = await prisma.bodypart.findMany({
    orderBy: { name: 'asc' },
  });
  allBodyparts.forEach((bp) => {
    console.log(`   - ${bp.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

