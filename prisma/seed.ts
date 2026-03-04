import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mot de passe par défaut pour le seed (à changer après le premier login)
const DEFAULT_PASSWORD = 'Calypso123';

// Utilisateur E2E : doit correspondre à E2E_USERNAME / E2E_PASSWORD dans .env
const E2E_USER_NAME = 'Testeuse';
const E2E_USER_PASSWORD = 'Test1234';

// Données de démonstration avec les 3 catégories
const mockExercices = [
  // ==================== HAUT DU CORPS ====================
  {
    name: "Rotation des épaules",
    descriptionText: "Assise ou debout, effectuez des rotations lentes des épaules vers l'avant, puis vers l'arrière. Gardez les bras détendus le long du corps.",
    descriptionComment: "Commencez par de petits cercles et agrandissez progressivement. Respirez calmement.",
    workoutRepeat: '10',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: [],
    category: "UPPER_BODY",
    pinned: true,
  },
  {
    name: "Flexion des coudes",
    descriptionText: "Assise, pliez lentement le coude en amenant la main vers l'épaule, puis redescendez doucement. Alternez les bras.",
    descriptionComment: "Gardez le dos droit et l'épaule stable pendant le mouvement.",
    workoutRepeat: '8',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: [],
    category: "UPPER_BODY",
    pinned: false,
  },
  {
    name: "Ouverture des bras",
    descriptionText: "Assise, bras tendus devant vous, ouvrez lentement les bras sur les côtés comme si vous ouvriez un livre, puis revenez à la position initiale.",
    descriptionComment: "Gardez les épaules basses et respirez profondément.",
    workoutRepeat: '8',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: [],
    category: "UPPER_BODY",
    pinned: false,
  },
  {
    name: "Serrer une balle",
    descriptionText: "Tenez une balle molle dans la main et serrez-la pendant 5 secondes, puis relâchez. Répétez avec chaque main.",
    descriptionComment: "Utilisez une balle anti-stress ou une éponge si vous n'avez pas de balle.",
    workoutRepeat: '10',
    workoutSeries: '3',
    workoutDuration: null,
    equipments: ["Balle molle"],
    category: "UPPER_BODY",
    pinned: false,
  },
  {
    name: "Lever les bras au-dessus de la tête",
    descriptionText: "Assise ou debout, levez lentement les deux bras au-dessus de la tête, paumes face à face, puis redescendez doucement.",
    descriptionComment: "Allez jusqu'où vous pouvez confortablement, sans forcer.",
    workoutRepeat: '8',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: [],
    category: "UPPER_BODY",
    pinned: false,
  },

  // ==================== BAS DU CORPS ====================
  {
    name: "Montée de genoux assis",
    descriptionText: "Assise sur une chaise, levez un genou vers la poitrine en gardant le dos droit, puis reposez le pied. Alternez les jambes.",
    descriptionComment: "Tenez-vous au bord de la chaise si besoin pour plus de stabilité.",
    workoutRepeat: '10',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: ["Chaise"],
    category: "LOWER_BODY",
    pinned: true,
  },
  {
    name: "Extension de la jambe",
    descriptionText: "Assise, tendez une jambe devant vous parallèle au sol, maintenez 3 secondes, puis reposez. Alternez.",
    descriptionComment: "Gardez le pied flex (pointe vers vous) pour travailler le quadriceps.",
    workoutRepeat: '8',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: ["Chaise"],
    category: "LOWER_BODY",
    pinned: false,
  },
  {
    name: "Marche sur place",
    descriptionText: "Debout, marchez sur place en levant les genoux à hauteur confortable. Balancez les bras naturellement.",
    descriptionComment: "Tenez-vous à une chaise ou au mur si nécessaire pour garder l'équilibre.",
    workoutRepeat: null,
    workoutSeries: null,
    workoutDuration: "2 minutes",
    equipments: [],
    category: "LOWER_BODY",
    pinned: false,
  },
  {
    name: "Flexion des chevilles",
    descriptionText: "Assise, les pieds au sol, levez les orteils vers le plafond en gardant les talons au sol, puis reposez. Vous pouvez aussi faire l'inverse : lever les talons.",
    descriptionComment: "Excellent pour la circulation et la mobilité des chevilles.",
    workoutRepeat: '15',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: [],
    category: "LOWER_BODY",
    pinned: false,
  },
  {
    name: "Se lever d'une chaise",
    descriptionText: "Assise au bord d'une chaise, penchez-vous vers l'avant et levez-vous en utilisant vos jambes. Rasseyez-vous doucement.",
    descriptionComment: "Croisez les bras sur la poitrine pour augmenter la difficulté, ou utilisez les accoudoirs pour vous aider.",
    workoutRepeat: '5',
    workoutSeries: '3',
    workoutDuration: null,
    equipments: ["Chaise"],
    category: "LOWER_BODY",
    pinned: false,
  },

  // ==================== ÉTIREMENTS ====================
  {
    name: "Étirement du cou",
    descriptionText: "Assise, inclinez doucement la tête vers l'épaule droite, maintenez 15 secondes, puis faites de même vers la gauche.",
    descriptionComment: "Ne forcez pas, laissez le poids de la tête faire le travail.",
    workoutRepeat: '3',
    workoutSeries: '1',
    workoutDuration: "15 secondes par côté",
    equipments: [],
    category: "STRETCHING",
    pinned: true,
  },
  {
    name: "Étirement des épaules",
    descriptionText: "Passez le bras droit devant vous, utilisez le bras gauche pour le tirer doucement vers la poitrine. Maintenez, puis changez de côté.",
    descriptionComment: "Gardez l'épaule basse, ne la remontez pas vers l'oreille.",
    workoutRepeat: '2',
    workoutSeries: '1',
    workoutDuration: "20 secondes par côté",
    equipments: [],
    category: "STRETCHING",
    pinned: false,
  },
  {
    name: "Étirement du dos - Chat/Vache",
    descriptionText: "À quatre pattes, alternez entre arrondir le dos (chat) et le creuser (vache). Bougez lentement avec la respiration.",
    descriptionComment: "Inspirez en creusant le dos, expirez en l'arrondissant.",
    workoutRepeat: '8',
    workoutSeries: '2',
    workoutDuration: null,
    equipments: ["Tapis"],
    category: "STRETCHING",
    pinned: false,
  },
  {
    name: "Étirement des mollets",
    descriptionText: "Debout face à un mur, une jambe en arrière tendue, l'autre pliée devant. Poussez le talon arrière vers le sol.",
    descriptionComment: "Vous devez sentir l'étirement dans le mollet de la jambe arrière.",
    workoutRepeat: '2',
    workoutSeries: '1',
    workoutDuration: "30 secondes par jambe",
    equipments: [],
    category: "STRETCHING",
    pinned: false,
  },
  {
    name: "Rotation du tronc",
    descriptionText: "Assise, tournez doucement le buste vers la droite en posant la main gauche sur le genou droit. Maintenez, puis changez de côté.",
    descriptionComment: "Gardez les hanches face à l'avant, seul le haut du corps tourne.",
    workoutRepeat: '3',
    workoutSeries: '1',
    workoutDuration: "15 secondes par côté",
    equipments: [],
    category: "STRETCHING",
    pinned: false,
  },
  {
    name: "Étirement des poignets",
    descriptionText: "Tendez le bras devant vous, paume vers le bas. Avec l'autre main, tirez doucement les doigts vers vous. Puis faites l'inverse (paume vers le haut).",
    descriptionComment: "Parfait pour détendre les mains après des exercices de préhension.",
    workoutRepeat: '2',
    workoutSeries: '1',
    workoutDuration: "15 secondes par position",
    equipments: [],
    category: "STRETCHING",
    pinned: false,
  },
];

async function main() {
  console.log('🌱 Début du seed avec les données de démonstration...\n');

  // Créer l'utilisateur Calypso avec un mot de passe par défaut
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  
  const calypso = await prisma.user.upsert({
    where: { name: 'Calypso' },
    update: {},
    create: { 
      name: 'Calypso',
      passwordHash,
      role: 'USER',
    },
  });
  console.log(`👤 Utilisateur créé : ${calypso.name} (mot de passe par défaut : ${DEFAULT_PASSWORD})`);

  const e2ePasswordHash = await bcrypt.hash(E2E_USER_PASSWORD, 12);
  const e2eUser = await prisma.user.upsert({
    where: { name: E2E_USER_NAME },
    update: { passwordHash: e2ePasswordHash },
    create: {
      name: E2E_USER_NAME,
      passwordHash: e2ePasswordHash,
      role: 'USER',
    },
  });
  console.log(`👤 Utilisateur E2E : ${e2eUser.name} (mot de passe : ${E2E_USER_PASSWORD})`);

  // Supprimer les exercices existants
  await prisma.exerciceBodypart.deleteMany();
  await prisma.exercice.deleteMany();
  console.log('🗑️  Anciennes données supprimées');

  // Insérer les exercices de démonstration
  console.log('\n🏋️ Insertion des exercices...\n');
  
  let upperCount = 0;
  let lowerCount = 0;
  let stretchingCount = 0;
  let coreCount = 0;

  for (const exercice of mockExercices) {
    await prisma.exercice.create({
      data: {
        name: exercice.name,
        descriptionText: exercice.descriptionText,
        descriptionComment: exercice.descriptionComment,
        workoutRepeat: exercice.workoutRepeat,
        workoutSeries: exercice.workoutSeries,
        workoutDuration: exercice.workoutDuration,
        equipments: JSON.stringify(exercice.equipments),
        category: exercice.category as "UPPER_BODY" | "LOWER_BODY" | "STRETCHING" | "CORE",
        pinned: exercice.pinned,
        userId: calypso.id,
      },
    });

    // Compter par catégorie
    if (exercice.category === 'UPPER_BODY') upperCount++;
    else if (exercice.category === 'LOWER_BODY') lowerCount++;
    else if (exercice.category === 'CORE') coreCount++;
    else stretchingCount++;

    console.log(`  ✓ ${exercice.name}`);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSUMÉ');
  console.log('═'.repeat(50));
  console.log(`💪 Haut du corps : ${upperCount} exercices`);
  console.log(`🦵 Bas du corps  : ${lowerCount} exercices`);
  console.log(`🧘 Étirements    : ${stretchingCount} exercices`);
  console.log(`🎯 Tronc         : ${coreCount} exercices`);
  console.log(`📌 Épinglés      : ${mockExercices.filter(e => e.pinned).length} exercices`);
  console.log('═'.repeat(50));
  console.log(`\n✅ ${mockExercices.length} exercices ont été importés avec succès !`);
  console.log('\n🚀 Lance "npm run dev" pour voir le résultat !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
