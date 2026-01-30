/**
 * Script pour exécuter `prisma db push` sur les deux bases de données (dev et prod)
 * 
 * Usage: 
 *   npx tsx scripts/db-push-all.ts
 * 
 * ⚠️ Ce script nécessite que DATABASE_URL et DATABASE_URL_DEV soient définis dans .env
 */

import { execSync } from 'child_process';

const getDatabaseUrl = (envVar: string): string | null => {
  const url = process.env[envVar];
  if (!url) {
    console.warn(`⚠️  ${envVar} n'est pas défini dans .env`);
    return null;
  }
  return url;
};

async function pushToDatabase(name: string, databaseUrl: string) {
  console.log(`\n🔄 Poussage du schéma vers ${name}...`);
  console.log(`   URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Masquer le mot de passe
  
  try {
    execSync(
      `npx prisma db push --skip-generate`,
      {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
        },
        stdio: 'inherit',
        cwd: process.cwd(),
      }
    );
    console.log(`✅ Schéma poussé avec succès vers ${name}`);
  } catch (error) {
    console.error(`❌ Erreur lors du push vers ${name}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Début du push du schéma Prisma vers toutes les bases de données\n');

  const devUrl = getDatabaseUrl('DATABASE_URL_DEV');
  const prodUrl = getDatabaseUrl('DATABASE_URL');

  if (!devUrl && !prodUrl) {
    throw new Error(
      'Aucune base de données configurée. Veuillez définir DATABASE_URL_DEV et/ou DATABASE_URL dans .env'
    );
  }

  const databases: Array<{ name: string; url: string }> = [];

  if (devUrl) {
    databases.push({ name: 'DÉVELOPPEMENT', url: devUrl });
  }

  if (prodUrl) {
    databases.push({ name: 'PRODUCTION', url: prodUrl });
  }

  console.log(`📊 ${databases.length} base(s) de données à synchroniser\n`);

  for (const db of databases) {
    await pushToDatabase(db.name, db.url);
  }

  // Régénérer le client Prisma après les pushes
  console.log('\n🔄 Régénération du client Prisma...');
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ Client Prisma régénéré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la régénération du client Prisma:', error);
    throw error;
  }

  console.log('\n✨ Toutes les bases de données ont été synchronisées avec succès !');
}

main().catch((error) => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});

