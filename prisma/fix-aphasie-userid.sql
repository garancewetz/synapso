-- Script pour ajouter userId aux tables AphasieItem et AphasieChallenge
-- et attribuer les citations existantes à Calypso
-- À exécuter directement dans votre base de données PostgreSQL

-- 1. Vérifier si la colonne userId existe déjà
DO $$
BEGIN
    -- Ajouter userId à AphasieItem si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AphasieItem' AND column_name = 'userId'
    ) THEN
        ALTER TABLE "AphasieItem" ADD COLUMN "userId" INTEGER;
        RAISE NOTICE 'Colonne userId ajoutée à AphasieItem';
    ELSE
        RAISE NOTICE 'Colonne userId existe déjà dans AphasieItem';
    END IF;

    -- Ajouter userId à AphasieChallenge si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AphasieChallenge' AND column_name = 'userId'
    ) THEN
        ALTER TABLE "AphasieChallenge" ADD COLUMN "userId" INTEGER;
        RAISE NOTICE 'Colonne userId ajoutée à AphasieChallenge';
    ELSE
        RAISE NOTICE 'Colonne userId existe déjà dans AphasieChallenge';
    END IF;
END $$;

-- 2. Attribuer les citations et challenges existants à Calypso
DO $$
DECLARE
    calypso_id INTEGER;
    items_count INTEGER;
    challenges_count INTEGER;
BEGIN
    -- Trouver l'ID de Calypso
    SELECT id INTO calypso_id FROM "User" WHERE name = 'Calypso' LIMIT 1;
    
    IF calypso_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur Calypso non trouvé dans la base de données';
    END IF;
    
    RAISE NOTICE 'Calypso trouvé avec ID: %', calypso_id;
    
    -- Attribuer les citations sans userId à Calypso
    UPDATE "AphasieItem" 
    SET "userId" = calypso_id 
    WHERE "userId" IS NULL;
    
    GET DIAGNOSTICS items_count = ROW_COUNT;
    RAISE NOTICE '% citations attribuées à Calypso', items_count;
    
    -- Attribuer les challenges sans userId à Calypso
    UPDATE "AphasieChallenge" 
    SET "userId" = calypso_id 
    WHERE "userId" IS NULL;
    
    GET DIAGNOSTICS challenges_count = ROW_COUNT;
    RAISE NOTICE '% challenges attribués à Calypso', challenges_count;
END $$;

-- 3. Rendre userId obligatoire (si pas déjà fait)
DO $$
BEGIN
    -- Pour AphasieItem
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AphasieItem' 
        AND column_name = 'userId' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "AphasieItem" ALTER COLUMN "userId" SET NOT NULL;
        RAISE NOTICE 'userId rendu obligatoire pour AphasieItem';
    END IF;

    -- Pour AphasieChallenge
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'AphasieChallenge' 
        AND column_name = 'userId' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "AphasieChallenge" ALTER COLUMN "userId" SET NOT NULL;
        RAISE NOTICE 'userId rendu obligatoire pour AphasieChallenge';
    END IF;
END $$;

-- 4. Ajouter les contraintes de clé étrangère (si pas déjà fait)
DO $$
BEGIN
    -- Pour AphasieItem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'AphasieItem' 
        AND constraint_name = 'AphasieItem_userId_fkey'
    ) THEN
        ALTER TABLE "AphasieItem" 
        ADD CONSTRAINT "AphasieItem_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Contrainte de clé étrangère ajoutée pour AphasieItem';
    END IF;

    -- Pour AphasieChallenge
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'AphasieChallenge' 
        AND constraint_name = 'AphasieChallenge_userId_fkey'
    ) THEN
        ALTER TABLE "AphasieChallenge" 
        ADD CONSTRAINT "AphasieChallenge_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Contrainte de clé étrangère ajoutée pour AphasieChallenge';
    END IF;
END $$;

-- 5. Ajouter les index (si pas déjà fait)
CREATE INDEX IF NOT EXISTS "AphasieItem_userId_idx" ON "AphasieItem"("userId");
CREATE INDEX IF NOT EXISTS "AphasieChallenge_userId_idx" ON "AphasieChallenge"("userId");

-- 6. Afficher un résumé
DO $$
DECLARE
    calypso_id INTEGER;
    total_items INTEGER;
    calypso_items INTEGER;
    total_challenges INTEGER;
    calypso_challenges INTEGER;
BEGIN
    SELECT id INTO calypso_id FROM "User" WHERE name = 'Calypso' LIMIT 1;
    
    SELECT COUNT(*) INTO total_items FROM "AphasieItem";
    SELECT COUNT(*) INTO calypso_items FROM "AphasieItem" WHERE "userId" = calypso_id;
    
    SELECT COUNT(*) INTO total_challenges FROM "AphasieChallenge";
    SELECT COUNT(*) INTO calypso_challenges FROM "AphasieChallenge" WHERE "userId" = calypso_id;
    
    RAISE NOTICE '=== RÉSUMÉ ===';
    RAISE NOTICE 'Total citations: %', total_items;
    RAISE NOTICE 'Citations de Calypso: %', calypso_items;
    RAISE NOTICE 'Total challenges: %', total_challenges;
    RAISE NOTICE 'Challenges de Calypso: %', calypso_challenges;
END $$;

