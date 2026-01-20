/**
 * Script pour extraire les équipements via l'API
 * 
 * Usage:
 * 1. Démarrer le serveur: npm run dev
 * 2. Exécuter ce script: tsx scripts/extract-equipments-api.ts
 * 
 * Note: Vous devez être authentifié (cookies de session)
 */

async function extractEquipmentsViaAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  const url = `${baseUrl}/api/admin/equipments`;

  try {
    console.log(`Appel de l'API: ${url}`);
    console.log('Note: Vous devez être authentifié pour utiliser cette route.\n');

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Afficher les résultats
    console.log('\n=== ÉQUIPEMENTS EXTRAITS DE LA BASE DE DONNÉES ===\n');
    console.log(`Nombre total d'équipements uniques: ${data.totalUnique}\n`);
    console.log('Équipements (triés par fréquence d\'utilisation):');
    console.log('─'.repeat(60));
    data.equipmentsWithCounts.forEach((eq: { name: string; count: number }, index: number) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${eq.name.padEnd(30)} (${eq.count} exercice${eq.count > 1 ? 's' : ''})`);
    });

    console.log('\n\n=== LISTE SIMPLE (pour copier-coller) ===\n');
    console.log(data.equipmentsList.join('\n'));

    console.log('\n\n=== DÉTAIL PAR EXERCICE ===\n');
    data.equipmentsByExercice.forEach((item: {
      exerciceId: number;
      exerciceName: string;
      userId: number;
      equipments: string[];
    }) => {
      console.log(`Exercice #${item.exerciceId} (User ${item.userId}): ${item.exerciceName}`);
      console.log(`  Équipements: ${item.equipments.join(', ')}`);
    });

  } catch (error) {
    console.error('Erreur lors de l\'extraction des équipements:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

extractEquipmentsViaAPI();
