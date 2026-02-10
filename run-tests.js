#!/usr/bin/env node

/**
 * Script pour lancer les tests E2E des jauges
 * Usage: node run-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Lancement des tests E2E pour les jauges...\n');

try {
  // Lancer les tests Playwright
  const testFile = path.join(__dirname, 'tests/e2e/gauges-update-on-date-change.spec.ts');
  
  console.log(`📋 Exécution du test: ${testFile}\n`);
  console.log('🔐 Connexion automatique avec: Testeuse / calylove\n');
  
  // Lancer Playwright en mode headed pour voir ce qui se passe
  execSync(
    `npx playwright test "${testFile}" --headed`,
    {
      stdio: 'inherit',
      cwd: __dirname,
    }
  );
  
  console.log('\n✅ Tests terminés avec succès !');
} catch (error) {
  console.error('\n❌ Erreur lors de l\'exécution des tests:', error.message);
  process.exit(1);
}
