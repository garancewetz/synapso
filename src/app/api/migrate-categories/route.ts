import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// Mapping direct des noms d'exercices vers les catégories
// Basé sur le fichier mockExercices.ts
const EXERCICE_CATEGORIES: Record<string, 'LOWER_BODY' | 'UPPER_BODY' | 'STRETCHING' | 'CORE'> = {
  // BAS DU CORPS
  "Papillon": "LOWER_BODY",
  "Torsion": "LOWER_BODY",
  "Montée de genoux": "LOWER_BODY",
  "Assis / Debout": "LOWER_BODY",
  "Escaliers": "LOWER_BODY",
  "Equilibre sur une jambe": "LOWER_BODY",
  "Levée de genoux": "LOWER_BODY",
  "Levée de jambe": "LOWER_BODY",
  "Pas chassés": "LOWER_BODY",
  "Marche": "LOWER_BODY",
  "Pont": "LOWER_BODY",
  "Pointes de pieds": "LOWER_BODY",
  "Talons / Pointes alternés": "LOWER_BODY",
  "Plier les jambes": "LOWER_BODY",
  
  // HAUT DU CORPS
  "Mains : Ouvrir / Fermer": "UPPER_BODY",
  "Mains : Ecarter les doigts": "UPPER_BODY",
  "Rotation des poignets": "UPPER_BODY",
  "Lever les bras": "UPPER_BODY",
  "Pompes contre le mur": "UPPER_BODY",
  "Rotation des bras": "UPPER_BODY",
  "Triceps": "UPPER_BODY",
  "Biceps avec haltères": "UPPER_BODY",
  "Rotation des épaules": "UPPER_BODY",
  "Flexion des coudes": "UPPER_BODY",
  "Ouverture des bras": "UPPER_BODY",
  "Serrer une balle": "UPPER_BODY",
  "Lever les bras au-dessus de la tête": "UPPER_BODY",
  
  // ÉTIREMENTS
  "Etirement Cou: Droite et gauche": "STRETCHING",
  "Etirement Cou: Haut et bas": "STRETCHING",
  "Etirement Cou: Rotation": "STRETCHING",
  "Etirement Trapèzes": "STRETCHING",
  "Etirement du dos": "STRETCHING",
  "Etirement Bras vers le haut": "STRETCHING",
  "Respiration abdominale": "STRETCHING",
  "Étirement du cou": "STRETCHING",
  "Étirement des épaules": "STRETCHING",
  "Étirement du dos - Chat/Vache": "STRETCHING",
  "Étirement des mollets": "STRETCHING",
  "Rotation du tronc": "STRETCHING",
  "Étirement des poignets": "STRETCHING",
};

// Mots-clés pour détecter automatiquement la catégorie
const LOWER_BODY_KEYWORDS = ['jambe', 'genou', 'pied', 'bassin', 'fessier', 'cuisse', 'cheville', 'escalier', 'marche', 'pont'];
const UPPER_BODY_KEYWORDS = ['bras', 'main', 'épaule', 'epaule', 'poignet', 'doigt', 'biceps', 'triceps', 'pompe'];
const STRETCHING_KEYWORDS = ['étirement', 'etirement', 'stretch', 'respiration', 'relaxation', 'cou', 'dos', 'nuque', 'trapèze'];

function detectCategory(name: string, description: string): 'LOWER_BODY' | 'UPPER_BODY' | 'STRETCHING' | 'CORE' {
  const text = (name + ' ' + description).toLowerCase();
  
  // Vérifier les mots-clés d'étirement en premier
  if (STRETCHING_KEYWORDS.some(kw => text.includes(kw))) {
    return 'STRETCHING';
  }
  
  // Vérifier bas du corps
  if (LOWER_BODY_KEYWORDS.some(kw => text.includes(kw))) {
    return 'LOWER_BODY';
  }
  
  // Vérifier haut du corps
  if (UPPER_BODY_KEYWORDS.some(kw => text.includes(kw))) {
    return 'UPPER_BODY';
  }
  
  // Défaut
  return 'UPPER_BODY';
}

export async function POST() {
  try {
    const exercices = await prisma.exercice.findMany();

    console.log(`🔄 Migration de ${exercices.length} exercices...`);

    let updated = 0;
    const results: { name: string; oldCategory: string; newCategory: string }[] = [];

    for (const exercice of exercices) {
      // Chercher dans le mapping direct d'abord
      let newCategory = EXERCICE_CATEGORIES[exercice.name];
      
      // Si pas trouvé, détecter automatiquement
      if (!newCategory) {
        newCategory = detectCategory(exercice.name, exercice.descriptionText || '');
      }

      // Mettre à jour si différent
      if (exercice.category !== newCategory) {
        await prisma.exercice.update({
          where: { id: exercice.id },
          data: { category: newCategory },
        });
        updated++;
        results.push({
          name: exercice.name,
          oldCategory: exercice.category,
          newCategory: newCategory,
        });
        console.log(`  ✓ ${exercice.name}: ${exercice.category} → ${newCategory}`);
      } else {
        console.log(`  - ${exercice.name}: déjà ${exercice.category}`);
      }
    }

    console.log(`\n✅ ${updated} exercices mis à jour !`);

    return NextResponse.json({
      success: true,
      totalExercices: exercices.length,
      updated: updated,
      changes: results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Permettre aussi GET pour faciliter l'appel
export async function GET() {
  return POST();
}
