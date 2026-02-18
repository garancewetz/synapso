/**
 * Exécute la migration des données journal (citations + tâches → notes)
 * sur les deux bases : DATABASE_URL (prod) et DATABASE_URL_DEV (dev).
 *
 * Usage : npx tsx scripts/migrate-journal-data-all.ts
 * ⚠️ Nécessite DATABASE_URL et DATABASE_URL_DEV dans .env
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';

config();

function getDatabaseUrl(envVar: string): string | null {
  const url = process.env[envVar];
  if (!url) {
    console.warn(`⚠️  ${envVar} n'est pas défini dans .env`);
    return null;
  }
  return url;
}

function runMigration(name: string, databaseUrl: string) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🔄 Migration vers ${name}...`);
  console.log(`   URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
  console.log('═'.repeat(50));

  execSync('npx tsx prisma/migrate-journal-data.ts', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log(`\n✅ Migration terminée pour ${name}`);
}

function main() {
  console.log('🚀 Migration des données journal (citations + tâches → notes)\n');

  const devUrl = getDatabaseUrl('DATABASE_URL_DEV');
  const prodUrl = getDatabaseUrl('DATABASE_URL');

  if (!devUrl && !prodUrl) {
    throw new Error(
      'Aucune base configurée. Définir DATABASE_URL_DEV et/ou DATABASE_URL dans .env'
    );
  }

  if (devUrl) {
    runMigration('DÉVELOPPEMENT (DATABASE_URL_DEV)', devUrl);
  }

  if (prodUrl) {
    runMigration('PRODUCTION (DATABASE_URL)', prodUrl);
  }

  console.log('\n✨ Migration exécutée sur toutes les bases configurées.');
}

try {
  main();
} catch (error) {
  console.error('\n❌ Erreur:', error);
  process.exit(1);
}
