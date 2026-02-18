/**
 * Supprime les anciennes tables AphasieItem et JournalTask.
 * À exécuter UNIQUEMENT après avoir vérifié que la migration des données
 * (db:migrate-journal-data) s’est bien passée et qu’aucune donnée n’a été perdue.
 *
 * Usage : npx tsx prisma/drop-old-journal-tables.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function tableExists(tableName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<[{ exists: boolean }]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) as exists
  `;
  return result[0]?.exists ?? false;
}

async function main() {
  console.log('Vérification des anciennes tables...\n');

  if (await tableExists('AphasieItem')) {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "AphasieItem" CASCADE');
    console.log('  Table AphasieItem supprimée.');
  } else {
    console.log('  Table AphasieItem absente.');
  }

  if (await tableExists('JournalTask')) {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "JournalTask" CASCADE');
    console.log('  Table JournalTask supprimée.');
  } else {
    console.log('  Table JournalTask absente.');
  }

  console.log('\nTerminé.');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
