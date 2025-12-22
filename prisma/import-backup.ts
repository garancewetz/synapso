import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function importBackup() {
  try {
    console.log('🔄 Début de l\'importation des données de backup...');

    // 1. Importer Bodyparts
    console.log('📦 Importation des bodyparts...');
    const bodypartsData = JSON.parse(
      readFileSync(join(process.cwd(), 'src/datas/bodyparts_backup.json'), 'utf-8')
    );
    
    for (const bodypart of bodypartsData) {
      await prisma.bodypart.upsert({
        where: { id: bodypart.id },
        update: {
          name: bodypart.name,
        },
        create: {
          id: bodypart.id,
          name: bodypart.name,
        },
      });
    }
    console.log(`✅ ${bodypartsData.length} bodyparts importés`);

    // 2. Récupérer l'utilisateur Calypso (par défaut)
    const calypso = await prisma.user.findUnique({
      where: { name: 'Calypso' },
    });
    
    if (!calypso) {
      throw new Error('Utilisateur Calypso non trouvé. Veuillez d\'abord exécuter la migration des utilisateurs.');
    }

    // 3. Importer Exercices
    console.log('📦 Importation des exercices...');
    const exercicesData = JSON.parse(
      readFileSync(join(process.cwd(), 'src/datas/exercices_backup.json'), 'utf-8')
    );
    
    for (const exercice of exercicesData) {
      await prisma.exercice.upsert({
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
          completedAt: exercice.completedAt ? new Date(exercice.completedAt) : null,
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
          completedAt: exercice.completedAt ? new Date(exercice.completedAt) : null,
          userId: calypso.id,
        },
      });
    }
    console.log(`✅ ${exercicesData.length} exercices importés`);

    // 4. Importer ExerciceBodyparts
    console.log('📦 Importation des relations exercice-bodypart...');
    const exerciceBodypartsData = JSON.parse(
      readFileSync(join(process.cwd(), 'src/datas/exerciceBodyparts_backup.json'), 'utf-8')
    );
    
    for (const eb of exerciceBodypartsData) {
      await prisma.exerciceBodypart.upsert({
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
    console.log(`✅ ${exerciceBodypartsData.length} relations exercice-bodypart importées`);

    // 5. Importer History
    console.log('📦 Importation de l\'historique...');
    const historyData = JSON.parse(
      readFileSync(join(process.cwd(), 'src/datas/history_backup.json'), 'utf-8')
    );
    
    for (const entry of historyData) {
      await prisma.history.upsert({
        where: { id: entry.id },
        update: {
          exerciceId: entry.exerciceId,
          completedAt: entry.completedAt ? new Date(entry.completedAt) : new Date(),
        },
        create: {
          id: entry.id,
          exerciceId: entry.exerciceId,
          completedAt: entry.completedAt ? new Date(entry.completedAt) : new Date(),
        },
      });
    }
    console.log(`✅ ${historyData.length} entrées d'historique importées`);

    // 6. Importer AphasieItems
    console.log('📦 Importation des items d\'aphasie...');
    const aphasieData = JSON.parse(
      readFileSync(join(process.cwd(), 'src/datas/aphasie_backup.json'), 'utf-8')
    );
    
    for (const item of aphasieData) {
      await prisma.aphasieItem.upsert({
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
    console.log(`✅ ${aphasieData.length} items d'aphasie importés`);

    console.log('✨ Importation terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importBackup();

