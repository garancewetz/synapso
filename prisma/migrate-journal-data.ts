/**
 * Migration des données journal : citations (AphasieItem), tâches (JournalTask)
 * et anciennes notes (content → description) vers le nouveau modèle JournalNote.
 * À exécuter AVANT db:push pour ne perdre aucune donnée.
 *
 * Ordre obligatoire :
 * 1. Migrer les données : npm run db:migrate-journal-data
 * 2. Puis appliquer le schéma : npm run db:push
 * 3. (Optionnel) Supprimer les anciennes tables : npx tsx prisma/drop-old-journal-tables.ts
 *
 * Usage : npm run db:migrate-journal-data  ou  npx tsx prisma/migrate-journal-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TableExistsResult = [{ exists: boolean }];

async function tableExists(tableName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<TableExistsResult>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) as exists
  `;
  return result[0]?.exists ?? false;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${columnName}
    ) as exists
  `;
  return result[0]?.exists ?? false;
}

async function ensureJournalNoteColumns(): Promise<void> {
  const journalNoteExists = await tableExists('JournalNote');
  if (!journalNoteExists) {
    return;
  }

  if (!(await columnExists('JournalNote', 'description'))) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "JournalNote" ADD COLUMN IF NOT EXISTS "description" TEXT DEFAULT \'\''
    );
    console.log('  Colonne JournalNote.description ajoutée.');
  }
  if (!(await columnExists('JournalNote', 'pinned'))) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "JournalNote" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN DEFAULT false'
    );
    console.log('  Colonne JournalNote.pinned ajoutée.');
  }
  if (!(await columnExists('JournalNote', 'validated'))) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "JournalNote" ADD COLUMN IF NOT EXISTS "validated" BOOLEAN DEFAULT false'
    );
    console.log('  Colonne JournalNote.validated ajoutée.');
  }
  if (!(await columnExists('JournalNote', 'validatedAt'))) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "JournalNote" ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMP'
    );
    console.log('  Colonne JournalNote.validatedAt ajoutée.');
  }
}

async function migrateAphasieItemToJournalNote(): Promise<number> {
  const exists = await tableExists('AphasieItem');
  if (!exists) {
    console.log('  Table AphasieItem absente, rien à migrer.');
    return 0;
  }

  const inserted = await prisma.$executeRaw`
    INSERT INTO "JournalNote" (title, description, pinned, validated, "validatedAt", "userId", "createdAt", "updatedAt")
    SELECT
      "quote",
      TRIM(COALESCE("meaning", '') || CASE WHEN "comment" IS NOT NULL AND TRIM("comment") != '' THEN E'\n\n' || "comment" ELSE '' END),
      false,
      false,
      NULL,
      "userId",
      "createdAt",
      "updatedAt"
    FROM "AphasieItem"
    WHERE NOT EXISTS (
      SELECT 1 FROM "JournalNote" jn
      WHERE jn.title = "AphasieItem"."quote"
        AND jn."userId" = "AphasieItem"."userId"
        AND jn."createdAt" = "AphasieItem"."createdAt"
    )
  `;
  console.log(`  Citations (AphasieItem) → JournalNote : ${inserted} ligne(s) insérée(s).`);
  return Number(inserted);
}

async function syncJournalNoteSequence(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"JournalNote"', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM "JournalNote")
    )
  `);
}

async function migrateJournalTaskToJournalNote(): Promise<number> {
  const exists = await tableExists('JournalTask');
  if (!exists) {
    console.log('  Table JournalTask absente, rien à migrer.');
    return 0;
  }

  await syncJournalNoteSequence();

  const hasContent = await columnExists('JournalNote', 'content');
  const hasDate = await columnExists('JournalNote', 'date');

  let inserted: number;

  if (hasContent && hasDate) {
    inserted = await prisma.$executeRaw`
      INSERT INTO "JournalNote" (title, description, "content", date, pinned, validated, "validatedAt", "userId", "createdAt", "updatedAt")
      SELECT
        "title",
        CASE WHEN "completed" = true THEN 'Tâche complétée.' ELSE '' END,
        CASE WHEN "completed" = true THEN 'Tâche complétée.' ELSE '' END,
        "completedAt",
        false,
        COALESCE("completed", false),
        "completedAt",
        "userId",
        "createdAt",
        "updatedAt"
      FROM "JournalTask"
      WHERE NOT EXISTS (
        SELECT 1 FROM "JournalNote" jn
        WHERE jn.title = "JournalTask"."title"
          AND jn."userId" = "JournalTask"."userId"
          AND jn."createdAt" = "JournalTask"."createdAt"
      )
    `;
  } else if (hasContent) {
    inserted = await prisma.$executeRaw`
      INSERT INTO "JournalNote" (title, description, "content", pinned, validated, "validatedAt", "userId", "createdAt", "updatedAt")
      SELECT
        "title",
        CASE WHEN "completed" = true THEN 'Tâche complétée.' ELSE '' END,
        CASE WHEN "completed" = true THEN 'Tâche complétée.' ELSE '' END,
        false,
        COALESCE("completed", false),
        "completedAt",
        "userId",
        "createdAt",
        "updatedAt"
      FROM "JournalTask"
      WHERE NOT EXISTS (
        SELECT 1 FROM "JournalNote" jn
        WHERE jn.title = "JournalTask"."title"
          AND jn."userId" = "JournalTask"."userId"
          AND jn."createdAt" = "JournalTask"."createdAt"
      )
    `;
  } else {
    inserted = await prisma.$executeRaw`
      INSERT INTO "JournalNote" (title, description, pinned, validated, "validatedAt", "userId", "createdAt", "updatedAt")
      SELECT
        "title",
        CASE WHEN "completed" = true THEN 'Tâche complétée.' ELSE '' END,
        false,
        COALESCE("completed", false),
        "completedAt",
        "userId",
        "createdAt",
        "updatedAt"
      FROM "JournalTask"
      WHERE NOT EXISTS (
        SELECT 1 FROM "JournalNote" jn
        WHERE jn.title = "JournalTask"."title"
          AND jn."userId" = "JournalTask"."userId"
          AND jn."createdAt" = "JournalTask"."createdAt"
      )
    `;
  }

  console.log(`  Tâches (JournalTask) → JournalNote : ${inserted} ligne(s) insérée(s).`);
  return Number(inserted);
}

async function migrateJournalNoteContentToDescription(): Promise<number> {
  const hasContent = await columnExists('JournalNote', 'content');
  if (!hasContent) {
    return 0;
  }

  const updated = await prisma.$executeRaw`
    UPDATE "JournalNote"
    SET description = CASE
      WHEN "content" IS NOT NULL AND TRIM("content") != '' THEN TRIM("content")
      ELSE COALESCE(description, '')
    END
    WHERE "content" IS NOT NULL AND TRIM("content") != ''
  `;
  console.log(`  Anciennes notes (content → description) : ${updated} ligne(s) mise(s) à jour.`);
  return Number(updated);
}

async function main() {
  console.log('Migration des données journal (citations + tâches → notes)...\n');

  console.log('Étape 1 : colonnes manquantes sur JournalNote...');
  await ensureJournalNoteColumns();

  console.log('\nÉtape 2 : content → description...');
  const countContent = await migrateJournalNoteContentToDescription();

  console.log('\nÉtape 3 : JournalTask → JournalNote...');
  const countTasks = await migrateJournalTaskToJournalNote();

  console.log('\nÉtape 4 : AphasieItem → JournalNote...');
  const countAphasie = await migrateAphasieItemToJournalNote();

  console.log('\nRésumé :');
  console.log(`  Descriptions mises à jour (content) : ${countContent}`);
  console.log(`  Tâches migrées    : ${countTasks}`);
  console.log(`  Citations migrées : ${countAphasie}`);
  console.log('\nMigration terminée.');
}

main()
  .catch((e) => {
    console.error('Erreur lors de la migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
