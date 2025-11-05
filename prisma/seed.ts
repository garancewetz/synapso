import { PrismaClient } from '@prisma/client';
import exercicesData from '../src/datas/exercices.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données...');

  // Supprime toutes les données existantes
  await prisma.exercice.deleteMany();
  await prisma.bodypart.deleteMany();
  await prisma.aphasieItem.deleteMany();

  // Extraire toutes les parties du corps uniques
  const allBodyparts = new Set<string>();
  exercicesData.forEach((exercice) => {
    exercice.bodyparts.forEach((bodypart: string) => {
      allBodyparts.add(bodypart);
    });
  });

  // Palette de couleurs pour les parties du corps
  const bodypartColors: { [key: string]: string } = {
    'Bassin': 'cyan',
    'Bras': 'rose',
    'Corps': 'amber',
    'Dos': 'blue',
    'Epaules': 'emerald',
    'Fessier': 'teal',
    'Jambes': 'yellow',
    'Mains': 'lime',
    'Nuque / Cervicales': 'indigo',
  };

  // Insère les parties du corps
  console.log('📍 Insertion des parties du corps...');
  const bodypartMap: { [key: string]: number } = {};
  for (const bodypart of Array.from(allBodyparts).sort()) {
    const color = bodypartColors[bodypart] || 'gray'; // Gris par défaut
    const created = await prisma.bodypart.create({
      data: {
        name: bodypart,
        color: color,
      },
    });
    bodypartMap[bodypart] = created.id;
  }
  console.log(`✅ ${allBodyparts.size} parties du corps ont été importées !`);

  // Insère les exercices depuis le fichier JSON
  console.log('🏋️ Insertion des exercices...');
  for (const exercice of exercicesData) {
    const createdExercice = await prisma.exercice.create({
      data: {
        id: exercice.id,
        name: exercice.name,
        descriptionText: exercice.description.text,
        descriptionComment: exercice.description.comment,
        workoutRepeat: exercice.workout.repeat,
        workoutSeries: exercice.workout.series,
        workoutDuration: exercice.workout.duration,
        equipments: JSON.stringify(exercice.equipments),
      },
    });

    // Crée les relations avec les bodyparts
    for (const bodypartName of exercice.bodyparts) {
      const bodypartId = bodypartMap[bodypartName];
      if (bodypartId) {
        await prisma.exerciceBodypart.create({
          data: {
            exerciceId: createdExercice.id,
            bodypartId: bodypartId,
          },
        });
      }
    }
  }

  console.log(`✅ ${exercicesData.length} exercices ont été importés avec succès !`);

  // Insère les items d'aphasie initiaux
  console.log('💬 Insertion des items d\'aphasie...');
  const aphasieItems = [
    {
      quote: "Le fachichme",
      meaning: "Le fascisme",
      date: "Octobre 2025",
      comment: null,
    },
    {
      quote: "C'est aluné",
      meaning: "C'est annulé",
      date: null,
      comment: "",
    },
    {
      quote: "Les mirketenshock",
      meaning: "Les birtkenstock",
      date: null,
      comment: "",
    },
  ];

  for (const item of aphasieItems) {
    await prisma.aphasieItem.create({
      data: {
        quote: item.quote,
        meaning: item.meaning,
        date: item.date || null,
        comment: item.comment || null,
      },
    });
  }

  console.log(`✅ ${aphasieItems.length} items d'aphasie ont été importés avec succès !`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

