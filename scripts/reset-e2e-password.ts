/**
 * Remet le mot de passe de l'utilisateur E2E en base à la valeur de .env (E2E_USERNAME / E2E_PASSWORD).
 * Utile après un test "change le mot de passe" qui a laissé la base avec un autre mot de passe.
 *
 * Usage : npx tsx scripts/reset-e2e-password.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

config();

if (process.env.DATABASE_URL_DEV) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_DEV;
}

const username = process.env.E2E_USERNAME;
const password = process.env.E2E_PASSWORD;

if (!username || !password) {
  console.error('E2E_USERNAME et E2E_PASSWORD doivent être définis dans .env');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(password!, 10);
  const user = await prisma.user.updateMany({
    where: { name: username },
    data: { passwordHash },
  });
  if (user.count === 0) {
    console.error(`Utilisateur "${username}" introuvable en base. Lancez le seed (npm run db:seed) pour le créer.`);
    process.exit(1);
  }
  console.log(`Mot de passe E2E mis à jour pour "${username}". Les tests pourront se connecter avec E2E_PASSWORD du .env.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
