# Guide de déploiement sur Netlify

Ce guide vous explique comment déployer l'application Synapso sur Netlify avec une base de données PostgreSQL.

## 📋 Prérequis

1. Un compte Netlify
2. Une base de données PostgreSQL (recommandé: [Supabase](https://supabase.com) ou [Neon](https://neon.tech) - gratuits)

## 🗄️ Étape 1: Créer une base de données PostgreSQL

### Option A: Supabase (Recommandé)

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet
3. Allez dans **Settings** → **Database**
4. Copiez la **Connection string** (URI) qui ressemble à:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Option B: Neon

1. Allez sur [neon.tech](https://neon.tech) et créez un compte
2. Créez un nouveau projet
3. Copiez la **Connection string** depuis le dashboard

## 🔧 Étape 2: Configurer le projet localement

1. **Modifiez le schéma Prisma** (déjà fait - utilise PostgreSQL)

2. **Créez un fichier `.env.local`** à la racine du projet:
   ```env
   # Base de données PostgreSQL (production)
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   
   # Pour migrer depuis SQLite (optionnel)
   DATABASE_URL_SQLITE="file:./prisma/dev.db"
   DATABASE_URL_POSTGRES="postgresql://user:password@host:port/database?schema=public"
   
   # Mot de passe admin
   EXERCISE_EDIT_PASSWORD="votre_mot_de_passe_admin"
   ```

3. **Générez le client Prisma**:
   ```bash
   npm run db:generate
   ```

4. **Créez les migrations pour PostgreSQL**:
   ```bash
   npm run db:migrate
   ```

5. **Si vous avez des données SQLite à migrer**, utilisez le script de migration:
   ```bash
   # Ajoutez DATABASE_URL_SQLITE et DATABASE_URL_POSTGRES dans .env.local
   tsx prisma/migrate-to-postgres.ts
   ```

## 🚀 Étape 3: Déployer sur Netlify

### Méthode 1: Via l'interface Netlify

1. **Poussez votre code sur GitHub/GitLab/Bitbucket**

2. **Connectez votre repository à Netlify**:
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - Cliquez sur **Add new site** → **Import an existing project**
   - Sélectionnez votre repository

3. **Configurez les variables d'environnement**:
   - Allez dans **Site settings** → **Environment variables**
   - Ajoutez:
     - `DATABASE_URL`: votre connection string PostgreSQL
     - `EXERCISE_EDIT_PASSWORD`: votre mot de passe admin

4. **Configurez les commandes de build** (déjà dans `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`

5. **Déployez**:
   - Netlify détectera automatiquement les changements
   - Ou cliquez sur **Deploy site**

### Méthode 2: Via Netlify CLI

1. **Installez Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Connectez-vous**:
   ```bash
   netlify login
   ```

3. **Initialisez le site**:
   ```bash
   netlify init
   ```

4. **Configurez les variables d'environnement**:
   ```bash
   netlify env:set DATABASE_URL "postgresql://..."
   netlify env:set EXERCISE_EDIT_PASSWORD "votre_mot_de_passe"
   ```

5. **Déployez**:
   ```bash
   netlify deploy --prod
   ```

## 🔄 Étape 4: Exécuter les migrations en production

Après le déploiement, vous devez exécuter les migrations Prisma sur la base de données de production.

### Option 1: Via Netlify Functions (recommandé)

Créez une fonction Netlify pour exécuter les migrations:

```typescript
// netlify/functions/migrate.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const handler = async (event, context) => {
  try {
    await execAsync('npx prisma migrate deploy');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Migrations applied successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

Puis appelez cette fonction après le déploiement.

### Option 2: Via votre machine locale

```bash
# Configurez DATABASE_URL avec l'URL de production
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

## ✅ Vérification

1. Vérifiez que votre site fonctionne sur l'URL Netlify
2. Testez les fonctionnalités principales
3. Vérifiez que la base de données est bien connectée

## 🔐 Sécurité

- ⚠️ **Ne commitez jamais** votre `.env` ou `.env.local`
- ⚠️ Utilisez des mots de passe forts pour `EXERCISE_EDIT_PASSWORD`
- ⚠️ Gardez votre `DATABASE_URL` privée (utilisez les variables d'environnement Netlify)

## 📝 Notes

- Les migrations Prisma doivent être exécutées après chaque déploiement si le schéma change
- Netlify exécute automatiquement `npm run build` lors du déploiement
- Le client Prisma est généré automatiquement lors du build

## 🆘 Dépannage

### Erreur: "Cannot find module '@prisma/client'"
Solution: Ajoutez `prisma generate` dans votre script de build:
```json
"build": "prisma generate && next build"
```

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correctement configurée dans Netlify
- Vérifiez que votre base de données PostgreSQL accepte les connexions externes
- Vérifiez les paramètres SSL si nécessaire

### Les migrations ne s'appliquent pas
- Exécutez manuellement `npx prisma migrate deploy` avec la `DATABASE_URL` de production

