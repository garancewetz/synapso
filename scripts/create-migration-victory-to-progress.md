# Migration Victory → Progress (Optionnel)

## État actuel ✅
Le code fonctionne ! Le modèle `Progress` est mappé à la table `Victory` via `@@map("Victory")`.

## Pour une migration propre (optionnel, à faire plus tard)

Si vous voulez vraiment renommer la table en base de données :

### Étape 1 : Créer la migration

```bash
npx prisma migrate dev --name rename_victory_to_progress --create-only
```

### Étape 2 : Éditer le fichier de migration créé

Dans `prisma/migrations/XXXXXX_rename_victory_to_progress/migration.sql`, remplacer le contenu par :

```sql
-- Migration: Renommer Victory en Progress
-- Préserve toutes les données existantes

-- Renommer la table
ALTER TABLE "Victory" RENAME TO "Progress";

-- Mettre à jour la séquence d'auto-incrémentation
ALTER SEQUENCE IF EXISTS "Victory_id_seq" RENAME TO "Progress_id_seq";

-- Mettre à jour les contraintes (adapter les noms si nécessaire)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Victory_pkey') THEN
    ALTER TABLE "Progress" RENAME CONSTRAINT "Victory_pkey" TO "Progress_pkey";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Victory_userId_fkey') THEN
    ALTER TABLE "Progress" RENAME CONSTRAINT "Victory_userId_fkey" TO "Progress_userId_fkey";
  END IF;
END $$;

-- Mettre à jour les index (adapter les noms si nécessaire)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Victory_userId_idx') THEN
    ALTER INDEX "Victory_userId_idx" RENAME TO "Progress_userId_idx";
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Victory_createdAt_idx') THEN
    ALTER INDEX "Victory_createdAt_idx" RENAME TO "Progress_createdAt_idx";
  END IF;
END $$;
```

### Étape 3 : Retirer le @@map du schéma

Dans `prisma/schema.prisma`, retirer la ligne `@@map("Victory")` du modèle `Progress`.

### Étape 4 : Appliquer la migration

```bash
npx prisma migrate deploy
```

### Étape 5 : Regénérer le client

```bash
npx prisma generate
```

## Note importante

**Cette migration n'est pas urgente !** L'application fonctionne parfaitement avec le `@@map("Victory")`. 
Vous pouvez faire cette migration propre plus tard, ou même jamais.

