-- Migration: Ajouter le champ tags à la table Victory (Progress)
-- Ce script ajoute une colonne tags de type TEXT[] (tableau de strings) avec une valeur par défaut vide

-- Ajouter la colonne tags si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'Victory' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE "Victory" 
    ADD COLUMN "tags" TEXT[] DEFAULT '{}';
    
    -- Créer un index si nécessaire (optionnel, pour les recherches)
    -- CREATE INDEX IF NOT EXISTS "Victory_tags_idx" ON "Victory" USING GIN ("tags");
  END IF;
END $$;

