/**
 * Applique le schéma Prisma sur la base de développement (DATABASE_URL_DEV).
 * Utilise --accept-data-loss pour supprimer les colonnes/tables obsolètes
 * (content, JournalTask) déjà migrées par db:migrate-journal-data.
 *
 * Usage : npx tsx scripts/db-push-dev.ts
 */

import { config } from 'dotenv';
import { execSync } from 'child_process';

config();

const devUrl = process.env.DATABASE_URL_DEV;
if (!devUrl) {
  console.error('DATABASE_URL_DEV manquant dans .env');
  process.exit(1);
}

console.log('Poussage du schéma vers la base DEV (DATABASE_URL_DEV)...');
console.log(`URL: ${devUrl.replace(/:[^:@]+@/, ':****@')}\n`);

execSync('npx prisma db push --accept-data-loss --skip-generate', {
  env: {
    ...process.env,
    DATABASE_URL: devUrl,
  },
  stdio: 'inherit',
  cwd: process.cwd(),
});

console.log('\n✅ Schéma appliqué sur la base dev.');
