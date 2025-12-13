import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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
    'DATABASE_URL ou DATABASE_URL_DEV doit être défini dans les variables d\'environnement'
  );
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

