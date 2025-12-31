# Guide de configuration pour les citations aphasie

## Problème
Les citations de Calypso ne s'affichent pas car :
1. La table `AphasieChallenge` n'existe peut-être pas encore
2. La colonne `userId` n'existe peut-être pas dans les tables `AphasieItem` et `AphasieChallenge`
3. Les citations existantes ne sont pas attribuées à Calypso

## Solution en 3 étapes

### Étape 1 : Synchroniser le schéma avec la base de données
```bash
npm run db:push
```
Cette commande crée toutes les tables manquantes et ajoute les colonnes nécessaires selon votre schéma Prisma actuel.

### Étape 2 : Appliquer le correctif pour attribuer les citations à Calypso
```bash
npm run db:fix-aphasie
```
Cette commande :
- Vérifie si la colonne `userId` existe
- L'ajoute si nécessaire
- Attribue toutes les citations et challenges existants à Calypso

### Étape 3 : Régénérer le client Prisma
```bash
npm run db:generate
```
Cette commande régénère le client Prisma avec les nouveaux modèles.

### Étape 4 : Vérifier l'état
```bash
npm run db:check-aphasie
```
Cette commande affiche l'état actuel de la base de données.

## Alternative : Utiliser Prisma Studio
Si vous préférez une interface graphique :
```bash
npm run db:studio
```
Puis vous pouvez :
1. Vérifier les tables existantes
2. Vérifier les données
3. Modifier manuellement si nécessaire

