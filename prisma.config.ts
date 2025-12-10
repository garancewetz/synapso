import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Charger les variables d'environnement depuis .env
config()

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
})
