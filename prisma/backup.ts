import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function backup() {
  try {
    console.log('🔄 Début du backup des tables Prisma...');

    // Backup Exercice
    const exercices = await prisma.exercice.findMany({
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
    });
    const exercicesData = exercices.map(ex => ({
      ...ex,
      bodyparts: ex.bodyparts.map(eb => ({
        exerciceId: eb.exerciceId,
        bodypartId: eb.bodypartId,
        bodypart: eb.bodypart,
      })),
    }));
    writeFileSync(
      join(process.cwd(), 'src/datas/exercices_backup.json'),
      JSON.stringify(exercicesData, null, 2),
      'utf-8'
    );
    console.log(`✅ ${exercices.length} exercices sauvegardés`);

    // Backup Bodypart
    const bodyparts = await prisma.bodypart.findMany();
    writeFileSync(
      join(process.cwd(), 'src/datas/bodyparts_backup.json'),
      JSON.stringify(bodyparts, null, 2),
      'utf-8'
    );
    console.log(`✅ ${bodyparts.length} bodyparts sauvegardés`);

    // Backup ExerciceBodypart
    const exerciceBodyparts = await prisma.exerciceBodypart.findMany();
    writeFileSync(
      join(process.cwd(), 'src/datas/exerciceBodyparts_backup.json'),
      JSON.stringify(exerciceBodyparts, null, 2),
      'utf-8'
    );
    console.log(`✅ ${exerciceBodyparts.length} exerciceBodyparts sauvegardés`);

    // Backup History
    const history = await prisma.history.findMany({
      include: {
        exercice: true,
      },
    });
    writeFileSync(
      join(process.cwd(), 'src/datas/history_backup.json'),
      JSON.stringify(history, null, 2),
      'utf-8'
    );
    console.log(`✅ ${history.length} entrées d'historique sauvegardées`);

    // Backup AphasieItem
    const aphasieItems = await prisma.aphasieItem.findMany();
    writeFileSync(
      join(process.cwd(), 'src/datas/aphasie_backup.json'),
      JSON.stringify(aphasieItems, null, 2),
      'utf-8'
    );
    console.log(`✅ ${aphasieItems.length} items d'aphasie sauvegardés`);

    // Backup Tache
    const taches = await prisma.tache.findMany();
    writeFileSync(
      join(process.cwd(), 'src/datas/taches_backup.json'),
      JSON.stringify(taches, null, 2),
      'utf-8'
    );
    console.log(`✅ ${taches.length} tâches sauvegardées`);

    console.log('✨ Backup terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backup();

