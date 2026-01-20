import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

// Charger les variables d'environnement depuis .env
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    const lines = envFile.split('\n');
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Retirer les guillemets si présents
          const cleanValue = value.replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = cleanValue;
          }
        }
      }
    });
  } catch (error) {
    console.warn('Impossible de charger le fichier .env, utilisation des variables d\'environnement existantes');
  }
}

// Charger le fichier .env
loadEnvFile();

// Utiliser DATABASE_URL_DEV en développement si disponible et si NEXT_PUBLIC_ENVIRONMENT est "dev"
const getDatabaseUrl = () => {
  const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev';
  if (isDev && process.env.DATABASE_URL_DEV) {
    return process.env.DATABASE_URL_DEV;
  }
  return process.env.DATABASE_URL;
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

async function extractEquipments() {
  try {
    // Récupérer tous les exercices avec leurs équipements
    const exercices = await prisma.exercice.findMany({
      select: {
        id: true,
        name: true,
        equipments: true,
        userId: true,
      },
    });

    const equipmentsSet = new Set<string>();
    const equipmentsCounts: Record<string, number> = {};
    const equipmentsByExercice: Array<{ exerciceId: number; exerciceName: string; equipments: string[] }> = [];

    exercices.forEach((exercice) => {
      try {
        const equipments = JSON.parse(exercice.equipments || '[]') as string[];
        if (Array.isArray(equipments)) {
          const validEquipments: string[] = [];
          equipments.forEach((eq: string) => {
            if (typeof eq === 'string' && eq.trim()) {
              const trimmed = eq.trim();
              validEquipments.push(trimmed);
              equipmentsSet.add(trimmed);
              equipmentsCounts[trimmed] = (equipmentsCounts[trimmed] || 0) + 1;
            }
          });
          if (validEquipments.length > 0) {
            equipmentsByExercice.push({
              exerciceId: exercice.id,
              exerciceName: exercice.name,
              equipments: validEquipments,
            });
          }
        }
      } catch (error) {
        console.warn(`Erreur de parsing pour l'exercice ${exercice.id} (${exercice.name}):`, error);
      }
    });

    // Trier les équipements par nombre d'occurrences (décroissant)
    const equipmentsWithCounts = Array.from(equipmentsSet)
      .map(eq => ({
        name: eq,
        count: equipmentsCounts[eq] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Afficher les résultats
    console.log('\n=== ÉQUIPEMENTS EXTRAITS DE LA BASE DE DONNÉES ===\n');
    console.log(`Nombre total d'équipements uniques: ${equipmentsSet.size}\n`);
    console.log('Équipements (triés par fréquence d\'utilisation):');
    console.log('─'.repeat(60));
    equipmentsWithCounts.forEach((eq, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${eq.name.padEnd(30)} (${eq.count} exercice${eq.count > 1 ? 's' : ''})`);
    });

    console.log('\n\n=== DÉTAIL PAR EXERCICE ===\n');
    equipmentsByExercice.forEach((item) => {
      console.log(`Exercice #${item.exerciceId}: ${item.exerciceName}`);
      console.log(`  Équipements: ${item.equipments.join(', ')}`);
    });

    console.log('\n\n=== LISTE SIMPLE (pour copier-coller) ===\n');
    console.log(Array.from(equipmentsSet).sort().join('\n'));

  } catch (error) {
    console.error('Erreur lors de l\'extraction des équipements:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

extractEquipments()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
