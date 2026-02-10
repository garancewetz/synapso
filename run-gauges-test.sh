#!/bin/bash

# Script pour lancer les tests E2E des jauges
# Usage: ./run-gauges-test.sh

echo "🚀 Lancement des tests E2E pour les jauges..."
echo ""

# Vérifier que le serveur de développement est lancé
if ! curl -s http://localhost:3003 > /dev/null 2>&1; then
    echo "⚠️  Le serveur de développement n'est pas accessible sur http://localhost:3003"
    echo "   Assurez-vous que 'npm run dev' est lancé dans un autre terminal"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Lancer les tests
echo "📋 Exécution des tests..."
npx playwright test tests/e2e/gauges-update-on-date-change.spec.ts

echo ""
echo "✅ Tests terminés !"
